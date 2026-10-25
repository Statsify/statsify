/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// The router generator puts a blank line between entries, so the license comment is one entry.
const LICENSE_HEADER = [
  [
    "/**",
    " * Copyright (c) Statsify",
    " *",
    " * This source code is licensed under the GNU AGPL v3 or later license found in the",
    " * LICENSE file in the root directory of this source tree.",
    " * https://github.com/Statsify/statsify/blob/main/LICENSE",
    " */",
  ].join("\n"),
  "/* eslint-disable */",
  "// @ts-nocheck",
];

// Files in `public/` are not hashed, so they get a day at the edge and in browsers. (`/og/` is the
// dynamic unfurl image route, so the static Open Graph images live under `/images/`.)
// Vite's hashed assets under `/assets/` are already served as immutable by Nitro.
const STATIC_ASSETS = { headers: { "cache-control": "public, max-age=86400" } };
// After the day, a browser uses its copy of a font while it revalidates it, so the root's font hold (`FONT_HOLD`)
// doesn't wait on a 304 on a return visit.
const FONTS = { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } };

// Logs the server bundle can't act on. Its libraries (motion, Radix, TanStack Router) start files with "use client",
// which only means something to React Server Components, and the site doesn't use them. Nitro names its library chunks
// with a function, which only leaves a label out of the bundler's timing report.
const IGNORED_LOGS = new Set(["MODULE_LEVEL_DIRECTIVE", "MISSING_CODE_SPLITTING_GROUP_DEBUG_NAME"]);

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  // Sourcemaps for Sentry, which the deploy uploads, without the comment that would point browsers at them.
  build: {
    sourcemap: "hidden",
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      router: { routeTreeFileHeader: LICENSE_HEADER },
    }),
    viteReact(),
    nitro({
      // Checks the config at startup, and closes the render pool, Redis and Sentry on shutdown, so SIGINT and SIGTERM end
      // the process.
      plugins: ["./src/server/config.plugin.ts", "./src/server/shutdown.plugin.ts"],
      routeRules: {
        "/fonts/**": FONTS,
        "/backgrounds/**": STATIC_ASSETS,
        "/games/**": STATIC_ASSETS,
        "/icons/**": STATIC_ASSETS,
        "/logos/**": STATIC_ASSETS,
        "/images/**": STATIC_ASSETS,
      },
      rolldownConfig: {
        onLog(level, log, handler) {
          if (!IGNORED_LOGS.has(log.code ?? "")) handler(level, log);
        },
      },
      // A `.br` and a `.gz` beside each text file in the public output (scripts, styles, fonts), which Nitro serves by the
      // request's Accept-Encoding.
      compressPublicAssets: { brotli: true, gzip: true },
    }),
  ],
});
