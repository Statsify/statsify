/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * The root's head: the page stays transparent over the dark background until both preloaded Minecraft faces load, at
 * most 500 ms, so a first visit usually lays its text out once, in Minecraft. On a slower connection it shows in the
 * fallback after that and swaps when the faces land. The script runs after the stylesheets, which declare the faces;
 * without scripts the page shows at once.
 */
export const FONT_HOLD = {
  style: ".fonts-wait body{opacity:0}",
  script: `(function(){var d=document.documentElement,f=document.fonts;if(!f||!f.load)return;d.classList.add("fonts-wait");var show=function(){d.classList.remove("fonts-wait")};Promise.all([f.load("16px Minecraft"),f.load("bold 16px Minecraft")]).then(show,show);setTimeout(show,500)})()`,
};
