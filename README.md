# CasaGroup

Vite + React single-page app. A Hono `/api` dev middleware can be reintroduced under `vite/plugins/` when the backend is ready.

## Requirements

- Node.js 20+ and npm

## Commands

| Command | Description |
|--------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |

## Project layout

```
src/
  main.tsx       Entry (Helmet + React root)
  App.tsx        Routes + layout shell
  index.css      Tailwind entry
components/      UI and pages
lib/             Context, i18n, SEO config, utilities
data/            Mock / static data
types/           Shared TypeScript types
public/          Static assets (favicon, OG image, manifest)
vite/            Vite plugins
```

Path alias: `@/` → project root (see `vite.config.ts` and `tsconfig.app.json`).

## Environment variables

See [.env.example](.env.example). Do not commit real secrets.

## Production

`vite build` outputs `dist/`. Mount the Hono app from `src/api/index.ts` on your server for `/api`, or point the client at another API using `VITE_*` variables.
