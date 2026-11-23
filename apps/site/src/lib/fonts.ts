/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * For the `head()` links of pages with Mona Sans reading text in the first screen (Bingo's player-not-found
 * explanation, the text pages); everything else on the inner pages is Minecraft, and Mona Sans further down loads when
 * it is laid out.
 */
export const SANS_PRELOAD = {
  rel: "preload",
  href: "/fonts/StatsifySans-latin.woff2",
  as: "font",
  type: "font/woff2",
  crossOrigin: "anonymous",
} as const;

/**
 * The page stays transparent until both Minecraft faces load, at most 500 ms, so a first visit lays its text out once.
 * The script must run after the stylesheets, which declare the faces.
 */
export const FONT_HOLD = {
  style: ".fonts-wait body{opacity:0}",
  script: `(function(){var d=document.documentElement,f=document.fonts;if(!f||!f.load)return;d.classList.add("fonts-wait");var show=function(){d.classList.remove("fonts-wait")};Promise.all([f.load("16px Minecraft"),f.load("bold 16px Minecraft")]).then(show,show);setTimeout(show,500)})()`,
};
