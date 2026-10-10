# Statsify

You are working in the Statsify monorepo. Make conservative, repo-native cleanup changes only in the files relevant to the current feature.

## Working in this repo

### Before editing

- Read the existing command, schema, and nearby gamemode examples first.
- Prefer established Statsify patterns over new abstractions.
- Look at comparable commands/schemas such as BedWars and SkyWars (`apps/discord-bot/src/commands/bedwars`, `packages/schemas/src/player/gamemodes/bedwars`) when unsure and necessary.
- Keep changes tightly scoped to the requested command/schema.

### Code style

- Use existing Statsify utilities instead of local helpers when available.
- Use `@statsify/math` helpers such as `add`, `sub`, and `ratio` instead of hand-rolled reduce/sum/ratio logic.
- Use `@statsify/util` helpers such as `prettify`, `arrayGroup`, and other existing utilities instead of duplicating formatting/grouping logic.
- Prefer exported static registries/constants from schemas (e.g. `BEDWARS_MODES`) over duplicating lists in commands.
- Use typed constants like `const ITEMS = [...] as const` where they define a finite domain.
- Avoid extra files/abstractions unless they clearly reduce real complexity or match an existing local pattern.
- Keep logic close to the feature file when it is feature-specific.

### Schema / Mongo storage

- Do not store static or derivable data in Mongo.
- Store only player-specific values: counts, booleans, active selections, levels, weights, timestamps, etc.
- Do not store IDs, names, requirements, descriptions, colors, unlock text, or other non-unique metadata if they can be derived from static schema registries.
- Use schema registries to zip static metadata with compact stored arrays in the command/profile layer.
- If display names can be derived from IDs, use `prettify()` rather than maintaining ID-to-name maps.
- Keep explicit names only when `prettify()` would produce incorrect user-facing text.

### Discord command/profile

- Use the existing pagination patterns where comparable commands already do: `paginate()` and `scrollingPagination()` with the `Page` and `SubPage` types in `packages/discord/src/services/paginate.service.ts`, which provide the dropdowns and subpages. Gamemode commands get this through `BaseHypixelCommand`.
- Keep page definitions declarative when possible.
- Avoid duplicate switch logic; use maps for simple page labels/titles.
- Keep rendering helpers small and local unless shared across multiple commands.
- Use Minecraft color codes consistently and centrally when repeated.
- Do not move feature-specific display constants into generic shared files unless another feature actually needs them.

### Cleanup priorities

- Remove duplicated constants and lookup maps.
- Replace manual aggregation with shared helpers and static dimension arrays.
- Flatten hard-to-read boolean chains into named checks or switches.
- Preserve behavior unless the request explicitly asks to change it.
- Do not refactor unrelated code.

## Setup

T3 runs `node apps/scripts/src/setup-worktree.ts` when it creates a worktree (see `t3.json`). It links `config.js`/`config.json` and the texture pack from the main checkout, checks out `assets/public` and `assets/private` at the commits the branch pins, installs dependencies, restores the blurred backgrounds from a shared cache, and builds.

- turbo (2.9+) shares its build cache across worktrees on its own, so builds in a new worktree are mostly cache hits.
- If a worktree looks broken (missing deps, assets, config, or `dist`), rerun `node apps/scripts/src/setup-worktree.ts`. It is safe to rerun and to run in many worktrees at once.
- T3 passes `--force` when an agent removes or settles a thread's worktree, so worktrees with submodules are removed. T3's background storage cleanup does not, so it skips them; remove those manually with `git worktree remove --force <path>`.

## Verifying changes

- Run focused checks for each changed package: `pnpm --filter <package> typecheck` and `pnpm --filter <package> lint` (e.g. `api`, `discord-bot`, `@statsify/schemas`).
- Packages import each other through `dist`, so run `pnpm build` before any tests. turbo makes this fast.
- Tests never load `config.js` (`config()` returns defaults when `VITEST` is set), so `pnpm test --run` is safe. Coverage is thin (in-source tests plus `packages/rendering/tests`), so a clean build plus typecheck is the main signal.
- The T3 "Verify" script runs everything: `pnpm build && pnpm typecheck && pnpm lint && pnpm test --run`.
- Report exactly what changed, what passed, and what couldn't be verified.

## Do not (in worktrees)

- Start the API, Discord bot, support bot, verify server, or site. Every worktree shares one `config.js`, so they would share the Discord token, the Hypixel key, and ports, and the bot would re-post slash commands to the testing guild.
- Call the Hypixel API, or run anything in `apps/scripts` except `setup-worktree`.
- Run `docker compose`.
- Edit `config.js` or anything under `assets/`.
- Edit locales other than `locales/en-US`.
- Add or upgrade dependencies unless asked.

## Branches and threads

- Always pass `workspaceStrategy: { type: "worktree", baseRef: <integration branch>, branch: <name>, startFromOrigin: false }` to `t3_thread_launch`. Without it, the thread runs in the main checkout.
- Commit on the integration branch before launching threads. New worktrees only contain committed work.
- Branch names: `feat/`, `fix/`, or `chore/` plus a short kebab-case description (e.g. `feat/posthog-events`).
- Split work by folder. Keep `apps/api/src/hypixel`, `apps/api/src/redis`, `apps/api/src/leaderboards`, and `packages/schemas/src/metadata` to a single thread.
- For conflicts in `locales/en-US/default.json`, keep both sides' keys. For `pnpm-lock.yaml` conflicts, rerun `pnpm install`.
- Run the full verify after merging thread branches, before settling threads.

## Running locally (main checkout only)

Done by the maintainer in the main checkout. Agents in worktrees must not do these steps.

Need: `config.js` or `config.json` at the repo root, following `config.schema.js`. The loader checks `config.json` first.

- Required: `database.mongoUri` and `database.redisUrl`, `hypixelApi.key`, `api.port` and `api.mediaRoot`, `discordBot.token`, `discordBot.applicationId` and `discordBot.publicKey`, `apiClient.key` and `apiClient.route` (the bot calls your local API), `supportBot.guild` and `supportBot.memberRole` (the bot's verify commands read them at startup), and `environment`.
- Optional: `hypixelApi.timeout` (defaults to 5000), `discordBot.testingGuild` (lets commands register instantly), `discordBot.port`, `api.ignoreAuth`, and Sentry. With a Sentry DSN set, `sentry.tracesSampleRate` is required too.

Run it: start MongoDB and Redis (`compose.dev.yml`), then `pnpm build:watch`, then `pnpm api start` and `pnpm discord-bot start`. Apps resolve assets through `../../assets`, so always start them with `pnpm <app>`.
