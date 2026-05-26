# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

An [Eleventy (11ty)](https://www.11ty.dev/) static site generator that builds individual artefact detail pages for the [Cranach Digital Archive (CDA)](https://lucascranach.org). Each artefact type (paintings, drawings, graphics, archivals, literature) gets one HTML page per item, in both German and English. The generated output lands in `./docs/` and is deployed via rsync to lucascranach.org.

## Environment setup

Copy `.env.example` to `.env` and fill in the values before starting the dev server. The build fetches data from the CDA API and caches it in `.cache/`. If `.cache/` already has all JSON files, no API calls are made.

```
CACHE_FOLDER=.cache
API_ENDPOINT=https://lucascranach.org/data-proxy/json-data.php
METADATA_API_KEY=***
API_METADATA_EXIF_ENDPOINT=https://lucascranach.org/data-proxy/metadata-exif.php
```

The build is memory-intensive. On Linux/Mac, set a higher heap limit before running:
```
export NODE_OPTIONS=--max-old-space-size=4096
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server (German + English, unpublished artefacts visible) |
| `npm run dev-de` | Local dev — German only (faster) |
| `npm run dev-all` | Local dev — all artefacts including internal |
| `npm run build` | Production build → `./docs/` |
| `npm run intern` | Internal/staff build (includes unpublished artefacts) |
| `npm run preview` | Preview build (branch `preview/2026`) |
| `npm run lint:css` | Lint SCSS files |
| `npm run lint:js` | Lint JS files |
| `npm run lint:css:fix` | Auto-fix SCSS lint issues |
| `npm run lint:js:fix` | Auto-fix JS lint issues |

There are no automated tests in this project.

## Architecture

### Data flow

1. **`helper/sync-fetch-data.js`** — called synchronously at startup from `.eleventy.js`. Checks `.cache/` first; if the JSON file is absent, fetches from the API and writes it to `.cache/`. All subsequent data access reads from the in-memory result of this call — no further I/O during build.

2. **`.eleventy.js`** — the central config file. It:
   - Loads all artefact datasets at module load time (paintings, drawings, archivals, graphics-real, graphics-virtual, literature)
   - Registers 11ty collections (`paintingsDE`, `paintingsEN`, `drawingsDE`, …) that filter and sort the raw API data
   - Registers JavaScript functions (`translate`, `getBaseUrl`, `getLitRef`, `getObjectsForNavigation`, …) available in all templates
   - Controls which artefact types are generated via the `config` object at the top of the file (`generatePaintings`, `generateDrawings`, etc.)
   - Controls published/unpublished visibility via `showUnpublishedArtefacts` based on `ELEVENTY_ENV`

3. **`src/*.de.11ty.js` / `src/*.en.11ty.js`** — pagination entry points, one per artefact type per language. Each file exports `data` (which 11ty collection to paginate over, permalink pattern, layout) and a trivial `render` function. URL pattern: `/{lang}/{artefact-id}/`.

4. **`src/_layouts/*-item.11ty.js`** — layout templates, one per artefact type. These are plain JavaScript files that `require` individual components and assemble the full HTML string. They use `this` (11ty's context) to call the JavaScript functions registered in `.eleventy.js`.

5. **`src/_layouts/components/*.11ty.js`** — reusable UI snippets (image stripe, provenance, references, etc.). Each exports one or more named functions that receive `(eleventy, data, langCode, ...)` and return an HTML string.

### Environment modes

`ELEVENTY_ENV` controls three things simultaneously:
- **Path prefix** (`pathPrefix` in `config`): `""` (dev), `"artefacts"` (external), `"intern/artefacts"` (internal), `"intern/artefacts-preview"` (preview)
- **Unpublished visibility**: internal/preview/development show artefacts where `metadata.isPublished === false`
- **`config.onlyDevObjects`**: set to `true` in the config object to limit builds to a small hardcoded list of test inventory numbers for faster iteration during development

### Styling

SCSS source lives in `src/assets/styles/scss/` with the 7-1 pattern (abstracts, base, components, composition, utils, vendor). Compiled to `src/compiled-assets/main.css` via sass. The `watch:sass` script watches for changes. Stylelint enforces idiomatic property ordering.

### Translations

- **`src/_data/translations.json`** — server-side translation strings, accessed via the `translate(term, lang)` JavaScript function in templates
- **`src/_data/translations-client.json`** — client-side strings injected into the page as JSON for use by `main.js`

### Client-side JavaScript

`src/assets/scripts/main.js` is a single bundled file (not transpiled, not bundled by a tool — copied as-is). It handles OpenSeadragon image viewer initialization, the metadata editor form, the collect/compare feature (`cranach-collect`), and UI interactions. It expects `objectData` and `metadataFieldMappings` globals to be injected by the server-side template.

## Deployment

Three rsync shell scripts handle manual deploys:
- `rsync-live.sh` — production
- `rsync-intern.sh` — internal staff area
- `rsync-preview-2026.sh` — preview environment

GitHub Actions workflows auto-deploy on push:
- `preview/2026` branch → preview environment
- `preview/intern` branch → internal preview
- `intern` branch → internal
- `main` branch → external/production
