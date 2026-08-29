# CasaGroup Backend

Express + TypeScript + Prisma + MySQL API for the CasaGroup site.

## Requirements

- Node 20+
- MySQL 8 (Docker Compose preferred, or local MySQL)
- `ffmpeg` on PATH (for video poster generation)

## Quick start (Docker)

```bash
cd backend
cp .env.example .env
docker compose up -d
npm install
npx prisma db push
npm run db:seed
npm run dev
```

## Quick start (local MySQL)

1. Ensure MySQL is running on port `3306`
2. Create DB/user matching `.env` (`casagroup` / `casagroup`)
3. Then:

```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev
```

API: `http://localhost:4000`  
Health: `GET /health`  
Default admin: `admin` / `admin123`

## Scripts

- `npm run dev` - start API with hot reload
- `npm run db:push` - sync Prisma schema
- `npm run db:seed` - seed projects from mock data
- `npm run db:studio` - Prisma Studio

## Frontend

Set in the Next.js app `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Admin UI: `http://localhost:3000/admin-lx9k2m/login`
