/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * The page stays transparent until both Minecraft faces load, at most 500 ms, so a first visit lays its text out once.
 * The script must run after the stylesheets, which declare the faces.
 */
export const FONT_HOLD = {
  style: ".fonts-wait body{opacity:0}",
  script: `(function(){var d=document.documentElement,f=document.fonts;if(!f||!f.load)return;d.classList.add("fonts-wait");var show=function(){d.classList.remove("fonts-wait")};Promise.all([f.load("16px Minecraft"),f.load("bold 16px Minecraft")]).then(show,show);setTimeout(show,500)})()`,
};

/**
 * The screen's pixels per CSS pixel as `--dpr` on the root, for the `text-mc-snap-*` sizes: set before first paint, and
 * again when it changes (browser zoom, the window moving to another screen).
 */
export const PIXEL_RATIO_SCRIPT = `(function set(){var r=devicePixelRatio;document.documentElement.style.setProperty("--dpr",r);matchMedia("(resolution: "+r+"dppx)").addEventListener("change",set,{once:true})})()`;
