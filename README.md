# turbo-example — Polyglot Turbo Monorepo Showcase

One [Turborepo](https://turborepo.com) orchestrating **TypeScript, Python, and PHP** across
servers, a web app, two desktop frameworks, a mobile app, and a four-browser extension — all
driven by **Bun** and formatted with **Biome**.

The point isn't any single app; it's that **one task graph builds, tests, lints, and
typechecks every language**, and every client participates in **one coherent workflow**.

## The coherent demo: a "Document Toolkit"

Every client renders the **same** uploader (`@repo/ui`) calling the **same** typed client
(`@repo/client`) against the **same** contract (`@repo/api-contract`):

```
 web · electron · electrobun · extension · (mobile: shared logic)
                     │  upload PDF / image
                     ▼
        @repo/api  (Bun + Hono + OpenAPI)         ──►  /ui  Swagger docs
                     │  proxy
                     ▼
        python-api (FastAPI sidecar)
                     │
          ┌──────────┴───────────┐
          ▼                      ▼
   @repo/py-pdf (pypdf)   @repo/py-image (Pillow)

   php-server (Slim) ──► /api/* proxies to the same gateway
```

Upload a PDF → the API hands it to Python (`pypdf`) → get pages/title/word-count back.
Upload an image → Python (`Pillow`) resizes it → get the thumbnail back. The whole UI is
**multilingual (en-GB / zh-CN)** via `@repo/i18n`, with a language switcher on every surface.

## Layout

```
packages/                         apps/
  tsconfig/      shared TS configs   api/               Bun + Hono + @hono/zod-openapi
  biome-config/  shared Biome ruleset web/               Vite + React + Tailwind v4 + shadcn
  core/          framework-agnostic  python-api/        FastAPI sidecar (pypdf + Pillow)
  api-contract/  Zod = HTTP source    desktop-electron/  Electron + electron-builder
  client/        one typed API client desktop-electrobun/ Electrobun (bun-native)
  ui/            React/shadcn toolkit mobile/            Expo / React Native
  platform/      host detection + gate extension/         WXT → Chrome/Edge/Firefox/Safari
  i18n/          en-GB / zh-CN catalog php-server/        PHP 8.4 + Slim + Composer
  py-pdf/  py-image/  Python libs
```

## Quick start

```bash
bun install

bun run build          # turbo: build every package/app (TS, Python wheels, PHP, extension…)
bun run test           # turbo: bun:test + pytest + phpunit
bun run lint           # turbo: Biome (TS) + Ruff (Python) + Pint (PHP)
bun run check          # turbo: tsc --noEmit everywhere
bun run platform:info  # what THIS machine can build (see below)
bun run e2e            # Playwright e2e for the web app and the extension
```

Run the system locally:

```bash
docker compose up api python-api php-server web
# api:    http://localhost:3000      (Swagger UI at /ui, OpenAPI at /doc)
# web:    http://localhost:4173
# php:    http://localhost:8080/health  and  /api/health (proxied)
```

## Cross-compilation: what builds where

Desktop/mobile artifacts are **host-constrained**. This repo handles that two ways:
a **CI matrix** (`.github/workflows/ci.yml`) that builds each target on its native runner,
and a **platform guard** that gracefully **skips** incompatible targets locally.

| Target | Builds on Linux (this host)? | How |
|---|---|---|
| api / web / python / php | ✅ OS-agnostic | runtime only |
| Electron — Linux | ✅ | `electron-builder --linux` |
| Electron — Windows | ✅ | Wine via `docker compose --profile builder` |
| Electron — macOS | ❌ → CI | macOS signing only works on macOS |
| Electrobun | host only | builds for the current OS; CI matrix for the rest |
| Extension — Chrome/Edge/Firefox | ✅ | `wxt build` (+ `-b edge`, `-b firefox`) |
| Extension — Safari `.app` | ❌ → CI | `xcrun safari-web-extension-converter` (macOS) |
| Mobile — Android | ✅ w/ SDK | `expo run:android` |
| Mobile — iOS | ❌ → CI | requires macOS + Xcode |

`bun run platform:info` prints a live report for the current machine:

```
  ✅ Servers / web / python / php (any OS)
  ✅ Linux desktop (Electron/Electrobun)
  ✅ Windows desktop via Wine/Docker
  ⏭️  macOS desktop      ⏭️  iOS app      ⏭️  Android app
```

### How the guard works

`@repo/platform` exposes `checkRequirement()` and a `guarded-build` CLI. Platform-sensitive
build scripts wrap their real command:

```jsonc
"package:mac": "guarded-build --name desktop-electron:mac --requires macos -- electron-builder --mac"
```

On an incompatible host it prints `⏭️  skip desktop-electron:mac — requires macOS, host is
linux/x64` and **exits 0**, so `turbo run build` stays green everywhere; the CI matrix
produces the skipped artifacts on the right runner.

## Per-language tooling

| Language | Package manager | Test | Lint / format |
|---|---|---|---|
| TypeScript | Bun workspaces | `bun:test` | Biome |
| Python | uv | pytest | Ruff |
| PHP | Composer | PHPUnit | Laravel Pint |

Non-JS projects join the Turbo graph through a thin `package.json` whose scripts shell out to
`uv` / `composer`, so a single `turbo run <task>` drives the whole polyglot tree.

## Internationalisation

`@repo/i18n` holds the shared en-GB / zh-CN catalog used by every React surface and mobile.
The browser extension additionally uses [`@wxt-dev/i18n`](https://wxt.dev) to localise its
**manifest** name/description (generated `_locales/en` + `_locales/zh_CN`).

## End-to-end tests

Playwright drives the real React surfaces:

- **web** — builds the production bundle, serves it, and tests render + language switching +
  the upload flow (API stubbed via route interception).
- **extension** — loads the built MV3 extension into a persistent Chromium context, reads the
  service-worker id, and tests the popup the same way.

```bash
bunx playwright install chromium   # once
bun run e2e
```
