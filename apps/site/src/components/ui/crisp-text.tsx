/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/** Each Minecraft size's font pixel in CSS px, by the id its `--mc-crisp-*` theme variable points at (`app.css`). */
const SIZES = [
  ["mc-crisp-1", 1],
  ["mc-crisp-1-5", 1.5],
  ["mc-crisp-2", 2],
  ["mc-crisp-3", 3],
  ["mc-crisp-4", 4],
  ["mc-crisp-7", 7],
] as const;

/**
 * Fits the filters to the screen, before first paint and again when the pixel ratio changes (after the head's `--dpr`,
 * whose listener was added first): the snapped size's shadow goes to its font pixel, and where a font pixel is about
 * one screen pixel (16 on a 1× screen) the text keeps the font's own edges. Its letters land on whole pixels there,
 * and a symbol's half pixels can't: forced on or off they lose strokes, so they stay soft.
 */
const SCREEN_SCRIPT = `(function set(){var r=devicePixelRatio,p=document.createElement("span"),d;p.className="text-mc-snap-1.25";document.body.append(p);d=parseFloat(getComputedStyle(p).fontSize)/16;p.remove();document.querySelectorAll("#mc-crisp-snap feOffset").forEach(function(o){o.setAttribute("dx",d);o.setAttribute("dy",d)});document.querySelectorAll("filter[data-px]").forEach(function(f){var k=(f.id==="mc-crisp-snap"?d:+f.getAttribute("data-px"))*r;f.querySelectorAll("feFuncA").forEach(function(a){a.setAttribute("type",k<1.25?"identity":"discrete")})});matchMedia("(resolution: "+r+"dppx)").addEventListener("change",set,{once:true})})()`;

/**
 * The filters Minecraft text is drawn through: every pixel of the text fully on or off (the font's half-pixel symbols
 * and the 24's half pixels land between screen pixels, which a font softens), then its shadow, a copy one font pixel
 * down and right at a quarter of its colour, also on or off, under it. The shadow is drawn here rather than with
 * `text-shadow`, which would blend into the text's edges before the filter sees them. A pixel counts as on from 3/8
 * covered, not half, so a symbol's half-pixel stroke on a 1.25× to 1.5× screen keeps a pixel instead of vanishing.
 */
export function CrispTextFilters() {
  return (
    <>
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          {SIZES.map(([id, offset]) => (
            <CrispFilter key={id} id={id} offset={offset} />
          ))}
          <CrispFilter id="mc-crisp-snap" offset={1} />
        </defs>
      </svg>
      <script dangerouslySetInnerHTML={{ __html: SCREEN_SCRIPT }} />
    </>
  );
}

function CrispFilter({ id, offset }: { id: string; offset: number }) {
  return (
    <filter id={id} data-px={offset} x="-20%" y="-40%" width="150%" height="190%" colorInterpolationFilters="sRGB">
      <feComponentTransfer in="SourceGraphic" result="text">
        <feFuncA type="discrete" tableValues="0 0 0 1 1 1 1 1" suppressHydrationWarning />
      </feComponentTransfer>
      <feOffset in="text" dx={offset} dy={offset} result="moved" suppressHydrationWarning />
      <feComponentTransfer in="moved" result="shadow">
        <feFuncR type="linear" slope="0.25" />
        <feFuncG type="linear" slope="0.25" />
        <feFuncB type="linear" slope="0.25" />
        <feFuncA type="discrete" tableValues="0 0 0 1 1 1 1 1" suppressHydrationWarning />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="shadow" />
        <feMergeNode in="text" />
      </feMerge>
    </filter>
  );
}
