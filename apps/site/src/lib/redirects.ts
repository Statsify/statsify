/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";

const PATREON = "https://patreon.com/statsify";

const AUTHORIZE = "https://discord.com/oauth2/authorize?client_id=718827787422793820";

/** The bot in a user's own apps (Discord's user install), so its commands work anywhere, with only `applications.commands`. */
const ADD_APP_URL = `${AUTHORIZE}&integration_type=1&scope=applications.commands`;

/** The vanity redirects, answered with a 301 before routing. */
const REDIRECTS: Readonly<Record<string, string>> = {
  "/invite": `${AUTHORIZE}&scope=applications.commands%20bot&permissions=412384021568`,
  "/invite-user": ADD_APP_URL,
  "/discord": "https://discord.gg/5VgxMQY",
  "/support": "https://discord.gg/ZnV3VcHyEJ",
  "/premium": PATREON,
  "/patreon": PATREON,
  "/donate": PATREON,
  "/github": "https://github.com/Statsify/statsify",
  "/twitter": "https://twitter.com/statsifybot",
  "/youtube": "https://youtube.com/@statsifybot",
  "/terms": "https://j4cobi.notion.site/Statsify-Terms-of-Service-0482207df97f4f41909594241cd0b381",
  "/privacy": "https://j4cobi.notion.site/Statsify-Privacy-Policy-2e636dcacf1e4237b35d7d2ce2d53613",
  "/translate": "https://crowdin.com/project/statsify",
};

/** The Next app's Bingo URLs: `/players` and `/players/:slug[/general[/bingo]]`, in any case, as Next matched them. */
const LEGACY_PLAYERS = /^\/players(?:\/([^/]+)(?:\/general(?:\/bingo)?)?)?$/i;

/** `/p/:name`, the short alias for `/player/:name`. */
const SHORT_PLAYER = /^\/p\/([^/]+)$/;

/** Where a path redirects to (absolute URL or site path), or `undefined` to route it normally. */
export function redirectFor(pathname: string): string | undefined {
  // The lookbehind starts a match only at a run's first slash; `/\/+$/` retries at every slash of a run, which is
  // quadratic on a path of thousands of them.
  const path = pathname.length > 1 ? pathname.replace(/(?<!\/)\/+$/, "") : pathname;

  // English is served unprefixed. Answering here, before the router, takes `/en-US/` there in one hop rather than a
  // trailing-slash redirect followed by the locale route's.
  const english = `/${DEFAULT_LOCALE}`;
  if (path === english || path.startsWith(`${english}/`)) return sitePath(path.slice(english.length));

  // Next matched the vanity links in any case (`/Discord`), so they still do.
  const vanity = REDIRECTS[path.toLowerCase()];
  if (vanity) return vanity;

  const players = LEGACY_PLAYERS.exec(path);
  if (players) return players[1] ? `/player/${players[1]}/bingo` : "/bingo";

  const short = SHORT_PLAYER.exec(path);
  if (short) return `/player/${short[1]}`;

  // Any other trailing slash too: a 301 with the other redirects' cache headers rather than the router's 307.
  return path === pathname ? undefined : sitePath(path);
}

/**
 * A path on this site, its leading slashes collapsed to one. Backslashes count, as browsers read them as slashes, so a
 * remainder like `//evil.example` can never become a link to another host.
 */
function sitePath(path: string): string {
  return path.replace(/^[\\/]*/, "/");
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("redirectFor", () => {
    it("maps every old Bingo URL", () => {
      expect(redirectFor("/players")).toBe("/bingo");
      expect(redirectFor("/players/")).toBe("/bingo");
      expect(redirectFor("/players/j4cobi")).toBe("/player/j4cobi/bingo");
      expect(redirectFor("/players/j4cobi/general")).toBe("/player/j4cobi/bingo");
      expect(redirectFor("/players/j4cobi/general/bingo")).toBe("/player/j4cobi/bingo");
      expect(redirectFor("/Players/J4cobi")).toBe("/player/J4cobi/bingo");
      expect(redirectFor("/players/j4cobi/other")).toBeUndefined();
    });

    it("shortens /p/:name to the player page", () => {
      expect(redirectFor("/p/j4cobi")).toBe("/player/j4cobi");
      expect(redirectFor("/p/j4cobi/")).toBe("/player/j4cobi");
      expect(redirectFor("/p")).toBeUndefined();
      expect(redirectFor("/p/j4cobi/bingo")).toBeUndefined();
    });

    it("answers the vanity links and nothing else", () => {
      expect(redirectFor("/discord")).toBe("https://discord.gg/5VgxMQY");
      expect(redirectFor("/discord/")).toBe("https://discord.gg/5VgxMQY");
      expect(redirectFor("/")).toBeUndefined();
      expect(redirectFor("/player/j4cobi/bingo")).toBeUndefined();
      expect(redirectFor("/DISCORD/")).toBe("https://discord.gg/5VgxMQY");
    });

    it("drops the English prefix and a trailing slash without leaving the site", () => {
      expect(redirectFor("/en-US")).toBe("/");
      expect(redirectFor("/en-US/leaderboards/")).toBe("/leaderboards");
      expect(redirectFor("/en-US//evil.example/x")).toBe("/evil.example/x");
      expect(redirectFor("/en-US/\\evil.example")).toBe("/evil.example");
      expect(redirectFor("/player/j4cobi/")).toBe("/player/j4cobi");
    });
  });
}
