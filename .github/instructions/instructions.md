# Copilot instructions — Statsify

Statsify is a monorepo for a Hypixel/Minecraft-focused **Discord bot** and its supporting services (API, web site, support bot, skin renderer, etc).

## Running an app (NOT needed for most changes)
Apps need external services and secrets, so avoid running them just to validate code; rely on build + lint + types + tests instead.

## Project layout
- **`apps/`** — runnable services, each with a root `package.json` workspace script (`pnpm <name> <cmd>`): `api`, `discord-bot`, `support-bot`, `verify-server`, `site` (Next.js), `scripts`, etc.
- **`packages/`** — non-runnable shared libraries named `@statsify/{name}`: `api-client`, `assets`, `discord`, `logger`, `math`, `rendering`, `schemas`, `skin-renderer` (Rust/WASM), `util`, etc.
- Put shared logic in a package; do not duplicate it across apps. Packages must not be runnable.
- **Per-workspace scripts** are typically uniform: `build` (SWC → `dist/`), `test:types` (`tsc --noEmit`), `lint` (`eslint`). Exceptions: `apps/site` (Next.js, no `test:types`), `apps/scripts` (no `build`/`test:types`), `packages/skin-renderer` (Rust/NAPI/WASM build; `lint` runs `cargo fmt && cargo clippy`).
- **Config (all at root):** `eslint.config.js`, `tsconfig.base.json` (NodeNext, strict, `target: esnext`), `turbo.json`, `.swcrc`, `vitest.shared.ts`, `vitest.workspace.ts`, `rustfmt.toml`, `Cargo.toml` (workspace = `packages/skin-renderer`). Build outputs (`dist`, `.next`, `pkg`) and `node_modules` are git-ignored and eslint-ignored.

When reviewing, flag code that is inconsistent with surrounding patterns, or that isn't fast or scalable.
