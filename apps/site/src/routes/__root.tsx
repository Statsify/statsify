/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import appCss from "~/styles/app.css?url";
import { FONT_HOLD } from "~/lib/fonts";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";
import { colors } from "@statsify/tokens";
import { localeFromPath } from "~/i18n/locales";
import type { ReactNode } from "react";
import type { RouterContext } from "~/router";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Statsify" },
      { name: "theme-color", content: colors.blueify[500] },
      { name: "color-scheme", content: "dark" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logos/logo_64.png" },
      // Mona Sans is preloaded only by the routes that use it (`~/lib/fonts`); every page has Minecraft headings.
      { rel: "preload", href: "/fonts/Minecraft.ttf", as: "font", type: "font/ttf", crossOrigin: "anonymous" },
      { rel: "preload", href: "/fonts/Minecraft Bold.ttf", as: "font", type: "font/ttf", crossOrigin: "anonymous" },
    ],
    styles: [{ children: FONT_HOLD.style }],
    scripts: [{ children: FONT_HOLD.script }],
  }),
  shellComponent: RootDocument,
  component: Outlet,
});

function RootDocument({ children }: { children: ReactNode }) {
  const lang = useRouterState({ select: (state) => localeFromPath(state.location.pathname) });

  return (
    <html lang={lang}>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased leading-[normal] min-h-screen flex flex-col bg-blackify-950 font-medium">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
