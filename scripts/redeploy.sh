#!/usr/bin/env bash
# Redeploy CasaGroup on the server: backup DB → pull → build → restart.
#
# Usage (on the server):
#   cd /var/www/csasgroup
#   bash scripts/redeploy.sh
#
# Optional:
#   BRANCH=main bash scripts/redeploy.sh
#   SKIP_DB_PUSH=1 bash scripts/redeploy.sh   # skip prisma db push
#   SKIP_BACKUP=1 bash scripts/redeploy.sh    # emergency only
#
# Never runs db:seed.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${BRANCH:-main}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
ENV_FILE="$ROOT/backend/.env"
STAMP="$(date +%Y%m%d_%H%M%S)"

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

cd "$ROOT"

# ── 1. Backup database ──────────────────────────────────────────────
backup_database() {
  [[ -f "$ENV_FILE" ]] || die "Missing $ENV_FILE"

  # Load DATABASE_URL without sourcing the whole .env (avoids side effects).
  local database_url
  database_url="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | cut -d= -f2 - | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
  [[ -n "$database_url" ]] || die "DATABASE_URL not set in $ENV_FILE"

  # Parse mysql://user:pass@host:port/db with Node (handles special chars / URL encoding).
  local parsed
  parsed="$(DATABASE_URL="$database_url" node -e '
    const u = new URL(process.env.DATABASE_URL);
    if (u.protocol !== "mysql:") process.exit(2);
    const db = decodeURIComponent(u.pathname.replace(/^\//, "").split("?")[0]);
    process.stdout.write([
      decodeURIComponent(u.username || ""),
      decodeURIComponent(u.password || ""),
      u.hostname || "127.0.0.1",
      u.port || "3306",
      db,
    ].join("\n"));
  ')" || die "Could not parse DATABASE_URL (expected mysql://...)"

  local db_user db_pass db_host db_port db_name
  {
    IFS= read -r db_user
    IFS= read -r db_pass
    IFS= read -r db_host
    IFS= read -r db_port
    IFS= read -r db_name
  } <<< "$parsed"

  [[ -n "$db_name" ]] || die "Could not determine database name from DATABASE_URL"

  mkdir -p "$BACKUP_DIR"
  local backup_file="$BACKUP_DIR/casagroup-${STAMP}.sql.gz"

  log "Backing up MySQL database '${db_name}' → ${backup_file}"
  # MYSQL_PWD avoids shell-quoting issues (e.g. ! in passwords). --no-tablespaces
  # avoids PROCESS privilege errors on restricted DB users.
  MYSQL_PWD="$db_pass" mysqldump \
    -h "$db_host" \
    -P "$db_port" \
    -u "$db_user" \
    --single-transaction \
    --routines \
    --triggers \
    --no-tablespaces \
    "$db_name" | gzip > "$backup_file"

  local size
  size="$(du -h "$backup_file" | awk '{print $1}')"
  [[ -s "$backup_file" ]] || die "Backup file is empty"
  log "Backup OK (${size})"
}

# ── 2. Pull ─────────────────────────────────────────────────────────
pull_code() {
  log "Pulling ${BRANCH}"
  git fetch origin "$BRANCH"
  git pull --ff-only origin "$BRANCH"
}

# ── 3. Build ────────────────────────────────────────────────────────
build_apps() {
  log "Installing frontend deps"
  npm install --no-fund --no-audit

  log "Building frontend (Next.js)"
  npm run build

  (
    cd "$ROOT/backend"

    log "Installing backend deps"
    npm install --no-fund --no-audit

    [[ -f prisma/schema.prisma ]] || die "Missing backend/prisma/schema.prisma"

    log "Prisma generate"
    npx prisma generate

    if [[ "${SKIP_DB_PUSH:-0}" != "1" ]]; then
      log "Prisma db push (schema sync - does not seed)"
      npx prisma db push
    else
      log "Skipping prisma db push (SKIP_DB_PUSH=1)"
    fi

    log "Building backend"
    npm run build
  )
}

# ── 4. Restart ──────────────────────────────────────────────────────
restart_apps() {
  if command -v pm2 >/dev/null 2>&1; then
    log "Restarting PM2 processes"
    pm2 restart all
    pm2 status
  else
    die "pm2 not found - start/restart the apps manually"
  fi
}

# ── Run ─────────────────────────────────────────────────────────────
log "CasaGroup redeploy started at $(date -Is) (root: $ROOT)"

if [[ "${SKIP_BACKUP:-0}" == "1" ]]; then
  log "Skipping database backup (SKIP_BACKUP=1)"
else
  backup_database
fi

pull_code
build_apps
restart_apps

log "Redeploy finished at $(date -Is)"
log "Latest backup dir: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"/casagroup-*.sql.gz 2>/dev/null | tail -5 || true
