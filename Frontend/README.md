# SplitGo Frontend (Fancy Components Base)

Landing page rebuilt with React + Vite + Tailwind CSS v4 + Motion, following the installation base from Fancy Components docs.

## What is set up

- Tailwind CSS v4 (`@tailwindcss/vite` plugin + `@import "tailwindcss"`)
- Motion (`motion/react`) for hero and cards animation
- `shadcn` registry config for Fancy Components in `components.json`
- Alias `@/*` in `jsconfig.json` and `vite.config.js`

## Run locally

```bash
cd Frontend
npm install
npm run dev
```

## Build test

```bash
npm run build
```

## Fancy Components CLI notes

The docs show this flow:

```bash
npx shadcn@latest init
npx shadcn@latest add @fancy/<component-name>
```

In this project, `components.json` already contains:

```json
"registries": {
  "@fancy": "https://fancycomponents.dev/r/{name}.json"
}
```

You can add specific Fancy components when you choose exact names from their docs.

## Important files

- `src/App.jsx`: rebuilt landing page
- `src/index.css`: Tailwind v4 entry + base styles
- `vite.config.js`: React + Tailwind plugin + alias
- `components.json`: Fancy registry config
- `jsconfig.json`: alias mapping

## API proxy

Vite proxy is kept for backend integration:

- `/api` -> `http://localhost:8080`


