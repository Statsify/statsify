# Statsify

You are working in the Statsify monorepo. Follow existing Statsify patterns and keep changes scoped to the task.

## Do not (in worktrees)

- Start the API, Discord bot, support bot, verify server, or site. Every worktree shares one `config.js`, so they would share the Discord token, the Hypixel key, and ports, and the bot would re-post slash commands to the testing guild.
- Open, print, or log `config.js`. It holds the bot token and the Hypixel key, and anything you print ends up in your transcript. Use `config.schema.js` to see its shape.
- Call the Hypixel API, or run scripts in `apps/scripts` directly, other than `setup-worktree`. Builds run `clean-dist` on their own; that is fine.
- Run `docker compose`.
- Edit `config.js` or anything under `assets/`.
- Edit `packages/skin-renderer` (Rust) unless asked. Rust changes force a slow recompile in every worktree, and its lint runs `cargo clippy --fix`, which rewrites files.
- Edit locales other than `locales/en-US`.
- Add or upgrade dependencies unless asked.
- Rename, move, or remove a schema field, or change its leaderboard config, unless asked. Mongo paths and Redis leaderboard keys (e.g. `player.stats.bedwars.wins`) come from field names, and nothing migrates existing data, so stored stats would silently stop matching.
- Create or push git tags. Pushing a `v*` tag deploys to production.

## Branches and threads

- Never commit, merge, or rebase onto `main`, and never push to it. All work goes on a `feat/`, `fix/`, or `chore/` branch, and changes reach `main` only through a reviewed PR. If you find yourself on `main`, create a branch before making any change.
- Commit all work on your branch before ending your turn. Uncommitted work is lost when the thread's worktree is removed. Don't push, open PRs, or launch your own threads unless asked.
- Commit messages are scoped conventional commits, like `fix(schemas): …`, `fix(bedwars): …`, or `feat(discord-bot): …`.
- Branch names: `feat/`, `fix/`, or `chore/` plus a short kebab-case description (e.g. `feat/posthog-events`).
- Always pass `workspaceStrategy: { type: "worktree", baseRef: <integration branch>, branch: <name>, startFromOrigin: false }` to `t3_thread_launch`. Without it, the thread runs in the main checkout.
- Commit on the integration branch before launching threads. New worktrees only contain committed work.
- Split work by folder. Keep these to a single thread at a time, since most other code depends on them: `packages/discord` (the command framework), `apps/discord-bot/src/commands/base.hypixel-command.ts`, `apps/api/src/hypixel`, `apps/api/src/redis`, `apps/api/src/leaderboards`, and `packages/schemas/src/metadata`.
- For conflicts in `locales/en-US/default.json`, keep both sides' keys. For `pnpm-lock.yaml` conflicts, rerun `pnpm install`.
- Run the full verify after merging thread branches, before settling threads.

## Working in this repo

### Before editing

- Read the existing command, schema, and nearby gamemode examples first.
- Prefer established Statsify patterns over new abstractions.
- Look at comparable commands/schemas such as BedWars and SkyWars (`apps/discord-bot/src/commands/bedwars`, `packages/schemas/src/player/gamemodes/bedwars`) when unsure and necessary.
- Keep changes tightly scoped to the requested command/schema.

### Code style

- Every source file starts with the license header, or lint fails:

  ```ts
  /**
   * Copyright (c) Statsify
   *
   * This source code is licensed under the GNU GPL v3 license found in the
   * LICENSE file in the root directory of this source tree.
   * https://github.com/Statsify/statsify/blob/main/LICENSE
   */
  ```

- Use existing Statsify utilities instead of local helpers when available.
- Use `@statsify/math` helpers such as `add`, `sub`, and `ratio` instead of hand-rolled reduce/sum/ratio logic.
- Use `@statsify/util` helpers such as `prettify`, `arrayGroup`, and other existing utilities instead of duplicating formatting/grouping logic.
- Prefer exported static registries/constants from schemas (e.g. `BEDWARS_MODES`) over duplicating lists in commands.
- Use typed constants like `const ITEMS = [...] as const` where they define a finite domain.
- In `apps/discord-bot`, import through the aliases `#commands/*`, `#components`, `#services`, `#lib/*`, `#constants`, and `#themes` rather than relative paths.
- Avoid extra files/abstractions unless they clearly reduce real complexity or match an existing local pattern.
- Keep logic close to the feature file when it is feature-specific.
- Most files aren't formatted with oxfmt yet, so don't run it on them; it would reformat whole files and cause conflicts between threads. Match the surrounding style instead. `packages/util` is the exception: run `pnpm fmt` if you change it.

### Schema / Mongo storage

- Do not store static or derivable data in Mongo.
- Store only player-specific values: counts, booleans, active selections, levels, weights, timestamps, etc.
- Do not store IDs, names, requirements, descriptions, colors, unlock text, or other non-unique metadata if they can be derived from static schema registries.
- Use schema registries to zip static metadata with compact stored arrays in the command/profile layer.
- If display names can be derived from IDs, use `prettify()` rather than maintaining ID-to-name maps.
- Keep explicit names only when `prettify()` would produce incorrect user-facing text.
- Only use Hypixel API keys you can point to in existing code or in a response the user provides. A wrong key fails silently: typecheck passes and the stat always reads 0. If you can't confirm a key, list it as unverified.

### Discord command/profile

- User-facing text goes through `t("…")`, with keys in `locales/en-US/default.json`. Never hardcode strings.
- Command and option names must be 3 to 32 characters, descriptions and choice names 1 to 100, and string choice values at most 32, in every translation. `validate-commands` can't run in worktrees, so check these by hand.
- Use the existing pagination patterns where comparable commands already do: `paginate()` and `scrollingPagination()` with the `Page` and `SubPage` types in `packages/discord/src/services/paginate.service.ts`, which provide the dropdowns and subpages. Gamemode commands get this through `BaseHypixelCommand`.
- Keep page definitions declarative when possible.
- Avoid duplicate switch logic; use maps for simple page labels/titles.
- Keep rendering helpers small and local unless shared across multiple commands.
- Use Minecraft color codes consistently and centrally when repeated.
- Do not move feature-specific display constants into generic shared files unless another feature actually needs them.

### Cleanup

When the task is cleanup:

- Remove duplicated constants and lookup maps.
- Replace manual aggregation with shared helpers and static dimension arrays.
- Flatten hard-to-read boolean chains into named checks or switches.
- Preserve behavior unless the request explicitly asks to change it.
- Do not refactor unrelated code.

## Setup

T3 runs `node apps/scripts/src/setup-worktree.ts` when it creates a worktree (see `t3.json`). It links `config.js` and the texture pack from the main checkout, checks out `assets/public` and `assets/private` at the commits the branch pins, installs dependencies, restores the blurred backgrounds from a shared cache, and builds.

- turbo (2.9+) shares its build cache across worktrees on its own, so builds in a new worktree are mostly cache hits.
- If a worktree looks broken (missing deps, assets, config, or `dist`), rerun `node apps/scripts/src/setup-worktree.ts`. It is safe to rerun and to run in many worktrees at once.
- T3 passes `--force` when an agent removes or settles a thread's worktree, so worktrees with submodules are removed. T3's background storage cleanup does not, so it skips them; remove those manually with `git worktree remove --force <path>`.

## Verifying changes

- Run the checks CI runs, limited to the packages your branch changes and the packages that depend on them: `pnpm build && pnpm typecheck --affected && pnpm lint --affected && pnpm test --run`. This is also the T3 "Verify" script.
- Packages import each other through `dist`, so `pnpm build` comes first. turbo makes it fast.
- Tests never load `config.js` (`config()` returns defaults when `VITEST` is set), so `pnpm test --run` is safe. Coverage is thin (in-source tests plus `packages/rendering/tests`), so a clean build plus typecheck is the main signal.
- Rendered images (profiles, leaderboards, and other image output) can't be checked in a worktree. For any rendering change, say the image wasn't checked visually.

## Final report

End every thread with:

- **Branch:** name
- **Commits:** hash and message for each
- **Files:** each file touched
- **Checks:** each check run and its result
- **Not verified:** rendering not checked visually, unconfirmed Hypixel keys, and anything else you couldn't check

## Running locally (main checkout only)

Done by the maintainer in the main checkout. Agents in worktrees must not do these steps.

Need: `config.js` at the repo root, following `config.schema.js`. Use `config.js`, not `config.json`: the loader tries `config.json` first but node rejects importing it, so a `config.json` breaks every app.

- Required: `database.mongoUri` and `database.redisUrl`, `hypixelApi.key`, `api.port` and `api.mediaRoot`, `discordBot.token`, `discordBot.applicationId` and `discordBot.publicKey`, `apiClient.key` and `apiClient.route` (the bot calls your local API), `supportBot.guild` and `supportBot.memberRole` (the bot's verify commands read them at startup), and `environment`.
- Optional: `hypixelApi.timeout` (defaults to 5000), `discordBot.testingGuild` (lets commands register instantly), `discordBot.port`, `api.ignoreAuth`, and Sentry. With a Sentry DSN set, `sentry.tracesSampleRate` is required too.

Run it: start MongoDB and Redis (`compose.dev.yml`), then `pnpm build:watch`, then `pnpm api start` and `pnpm discord-bot start`. Apps resolve assets through `../../assets`, so always start them with `pnpm <app>`.
