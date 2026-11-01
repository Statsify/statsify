/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import appCss from "~/styles/app.css?url";
import { CLOCK_SCRIPT } from "~/lib/clock";
import { FONT_HOLD } from "~/lib/fonts";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";
import { LOGO_ICON } from "~/lib/tab-icon";
import { SEARCH_SCRIPT } from "~/components/search";
import { SKIN_FADE_SCRIPT } from "~/components/ui/skin";
import { colors } from "@statsify/tokens";
import { localeFromPath } from "~/i18n/locales";
import type { ReactNode } from "react";
import type { RouterContext } from "~/router";
import type { StaticDataRouteOption } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: ({ matches }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Statsify" },
      { name: "theme-color", content: colors.blueify[500] },
      { name: "color-scheme", content: "dark" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      tabIcon(matches),
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preload", href: "/fonts/Minecraft.ttf", as: "font", type: "font/ttf", crossOrigin: "anonymous" },
      { rel: "preload", href: "/fonts/Minecraft Bold.ttf", as: "font", type: "font/ttf", crossOrigin: "anonymous" },
    ],
    styles: [{ children: FONT_HOLD.style }],
    scripts: [{ children: FONT_HOLD.script }, { children: CLOCK_SCRIPT }, { children: SEARCH_SCRIPT }, { children: SKIN_FADE_SCRIPT }],
  }),
  shellComponent: RootDocument,
  component: Outlet,
});

/**
 * The page's one tab icon: the deepest route's `tabIcon`, else the logo. Only the root adds an icon link, so a page
 * never has two, and a new icon replaces the old one's link rather than joining it: browsers disagree on which of two
 * icons they show, and read the icons when a link is added, not when one is removed, so an icon link left behind kept
 * the last player's head in the tab.
 */
function tabIcon(matches: { staticData: StaticDataRouteOption; loaderData?: unknown }[]) {
  const href = matches.map((match) => match.staticData.tabIcon?.(match.loaderData)).findLast(Boolean);
  return href ? { rel: "icon", href } : LOGO_ICON;
}

function RootDocument({ children }: { children: ReactNode }) {
  const lang = useRouterState({ select: (state) => localeFromPath(state.location.pathname) });

  return (
    // `/player`'s head script sets `--recent` on the root before React hydrates it.
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased leading-[normal] min-h-screen flex flex-col bg-blackify-950">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
