# AGENTS.md

## Project Overview

**bing-wallpaper** — A Bun + TypeScript project that fetches Bing daily wallpapers and serves them as a static website.

- **Runtime**: Bun
- **Language**: TypeScript (ESM)
- **Dependencies**: Hono (web framework), @types/bun, @types/node

## Scripts

| Script               | Description                                        |
| -------------------- | -------------------------------------------------- |
| `bun run dev`        | Build wallpapers and start local preview server    |
| `bun run serve`      | Start the static file server (requires built data) |
| `bun run build`      | Fetch and process wallpapers into `data/`          |
| `bun run wallpapers` | Fetch latest wallpapers via API                    |
| `bun run markdown`   | Generate markdown output                           |
| `bun test`           | Run tests                                          |
| `bun fmt`            | Format code                                        |
| `bun check`          | Type-check code                                    |

## Project Structure

```
├── src/          # Source code (build scripts)
├── scripts/      # CLI scripts (serve, wallpapers, markdown)
├── data/         # Generated wallpaper data (images, metadata)
├── package.json  # Project config
├── tsconfig.json # TypeScript config
└── bun.lock      # Bun lockfile
```

## Guidelines

- Use ES modules (`"type": "module"` in package.json)
- Run `bun fmt` before committing
- Run `bun check` to verify types
- When modifying wallpaper fetching logic, check both CN and EN-US Bing endpoints
- Generated data in `data/` should not be manually edited
