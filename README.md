# CasaGroup

Next.js (App Router) + React. Public routes use the App Router; admin stays at `/admin-lx9k2m` without the public chrome.

## Requirements

- Node.js 20+ and npm

## Commands

| Command | Description |
|--------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start Next.js dev server (default [http://localhost:3000](http://localhost:3000)) |
| `npm run build` | Typecheck and production build |
| `npm run start` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |

## Project layout

```
app/             App Router: layouts, pages, sitemap.ts, robots.ts
components/      UI and page modules
lib/             Context, i18n, SEO config, utilities
data/            Mock / static data
types/           Shared TypeScript types
public/          Static assets (favicon, OG image, manifest)
```

Path alias: `@/` → project root (see `tsconfig.json`).

## Environment variables

See [.env.example](.env.example). Do not commit real secrets.

## Production

`next build` outputs `.next/`. Set `NEXT_PUBLIC_SITE_URL` to your canonical origin (no trailing slash) for correct canonicals, Open Graph, JSON-LD, `sitemap.xml`, and `robots.txt`.
