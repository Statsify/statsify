<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics across three apps in the Statsify monorepo: the NestJS REST API (`apps/api`), the Discord bot (`apps/discord-bot`), and the Minecraft verification server (`apps/verify-server`). Each app received a singleton PostHog client (`posthog.ts`) initialized from environment variables, plus event captures in route handlers and command listeners. User identification is performed on successful verification, linking Discord user IDs to Minecraft UUIDs. Exception tracking was added to the API's global Sentry interceptor. All apps handle graceful PostHog shutdown on SIGTERM/SIGINT.

| Event | Description | File |
|---|---|---|
| `command executed` | A Discord slash command was successfully executed | `apps/discord-bot/src/lib/command.listener.ts` |
| `user verified` | A Discord user successfully linked their Minecraft account | `apps/discord-bot/src/commands/verify.command.ts` |
| `user unverified` | A Discord user unlinked their Minecraft account | `apps/discord-bot/src/commands/unverify.command.ts` |
| `session reset` | A user reset their stat-tracking session | `apps/api/src/session/session.controller.ts` |
| `session deleted` | A user deleted their stat-tracking session | `apps/api/src/session/session.controller.ts` |
| `player deleted` | A player's cached data was deleted by an admin | `apps/api/src/player/player.controller.ts` |
| `verification code requested` | A Minecraft player joined the verify server to get a code | `apps/verify-server/src/index.ts` |
| `player leaderboard viewed` | A player leaderboard was queried | `apps/api/src/player/leaderboards/player-leaderboard.controller.ts` |
| `guild leaderboard viewed` | A guild leaderboard was queried | `apps/api/src/guild/leaderboards/guild-leaderboard.controller.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/362720/dashboard/1708250)
- [Verification funnel (wizard)](https://us.posthog.com/project/362720/insights/TmgNktO5) — Conversion from Minecraft server join → Discord link
- [Command usage over time (wizard)](https://us.posthog.com/project/362720/insights/7RcMKJt0) — Total Discord commands executed per day
- [Verifications vs unverifications (wizard)](https://us.posthog.com/project/362720/insights/S49eMaFY) — User account-linking churn signal
- [Session activity (wizard)](https://us.posthog.com/project/362720/insights/2Vilts99) — Session resets and deletions over time
- [Leaderboard usage (wizard)](https://us.posthog.com/project/362720/insights/scCT1KC1) — Player and guild leaderboard engagement

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
