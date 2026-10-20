/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

const PATREON = "https://patreon.com/statsify";

/** The vanity redirects, answered with a 301 before routing. */
const REDIRECTS: Readonly<Record<string, string>> = {
  "/invite":
    "https://discord.com/oauth2/authorize?client_id=718827787422793820&scope=applications.commands%20bot&permissions=412384021568",
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

export function redirectFor(pathname: string): string | undefined {
  return REDIRECTS[pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname];
}
