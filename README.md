# abdullah-website

My personal site and portfolio — built with [Astro](https://astro.build).

A small, fast, static site for showing what I'm building, what I've worked on, and how to get in touch. No tracking, no bloat — just content rendered at build time.

## Highlights

- **Home** — short intro and a snapshot of current focus
- **Projects** — selected side projects with short writeups and links
- **Experience** — roles and what I worked on at each
- Fully static — deploys anywhere (Vercel, Netlify, GitHub Pages, Cloudflare Pages)

## Tech stack

- [Astro 4](https://astro.build) (islands architecture, zero JS by default)
- TypeScript + a touch of vanilla JS for interactivity
- Plain CSS (no Tailwind here — kept it lean)

## Project structure

```
frontend/
  src/
    components/   # reusable Astro components
    layouts/      # page shells
    pages/        # routed pages (index, projects/, experience/)
    data/         # content data (projects, experience entries)
    scripts/      # client-side enhancements
    styles/       # global CSS
  public/         # static assets
  astro.config.mjs
  package.json
```

## Run locally

```bash
git clone https://github.com/abdullahomarrr/abdullah-website.git
cd abdullah-website/frontend
npm install
npm run dev          # http://localhost:4321
```

## Commands

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the local dev server            |
| `npm run build`   | Build the static site into `dist/`    |
| `npm run preview` | Preview the production build locally  |

## Deploy

The `frontend/dist/` directory is a fully static site. Point any static host at it (Vercel / Netlify / Cloudflare Pages / GitHub Pages) with the build command `npm run build` and the output directory `frontend/dist`.

## License

Code: MIT. Content and writing: © Abdullah Omar.
