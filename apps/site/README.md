# site

statsify.net: a [TanStack Start](https://tanstack.com/start) app served by Nitro's Node preset behind nginx and Cloudflare.

```sh
pnpm site dev        # http://localhost:7828
pnpm site build      # .output/, then scripts/check-public-output.ts
pnpm site start      # node .output/server/index.mjs on PORT (7828) and HOST (127.0.0.1)
```

7828 spells STAT on a phone keypad. The dev server answers only `localhost`; keep it that way, since it serves files from the whole repo.

Configuration comes from the repo's `config.js` (see `config.schema.js`): `apiClient.route`, `site.apiKey` and the optional `sentry.siteDsn`. Translations live in `locales/<locale>/site.json`; English is served unprefixed and other locales under `/{locale}/`.

Design tokens come from `@statsify/tokens`; fonts in `public/fonts/` are Minecraft, Mona Sans (OFL; instanced and subset as Statsify Sans, see `src/styles/fonts.css`) and Noto Sans subsets (OFL).
