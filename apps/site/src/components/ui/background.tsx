/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import { useState } from "react";

// The nine public backgrounds in `public/backgrounds/`; the private blurred set never ships. They are
// pre-blurred WebP (about 10 KB each), so no backdrop filter runs on top of them: a 2.4 px Gaussian on the 480 px image
// matches the Next site's 8 px backdrop blur on a 900 px tall screen.
const BACKGROUNDS = ["general", "guilds", "bingo", "bedwars", "skywars", "duels", "arcade", "uhc", "woolgames"] as const;

export type BackgroundName = (typeof BACKGROUNDS)[number];

/** The background named `name` (a game's `PlayerStats` key, say), or `general` when there's none by that name. */
export const backgroundFor = (name: string): BackgroundName =>
  (BACKGROUNDS as readonly string[]).includes(name) ? (name as BackgroundName) : "general";

const src = (background: BackgroundName) => `/backgrounds/${background}.webp`;

/**
 * Starts fetching a page's background from its route's loader, beside the page's data, so a game page doesn't sit on
 * plain #111 while its image loads after the content. Only in the browser; the server's HTML asks for it early anyway.
 */
export function preloadBackground(background: BackgroundName) {
  if (typeof Image === "undefined") return;
  const image = new Image();
  image.src = src(background);
}

export function Background({
  background,
  className,
  mask,
  priority = false,
  viewport = false,
}: {
  background: BackgroundName;
  className?: string;
  mask?: string;
  /** The page's first background: fetched early. Every other one waits until it nears the viewport. */
  priority?: boolean;
  /**
   * Fixed behind the page at the screen's largest height, instead of sized to the content: a long page keeps it all the
   * way down, a page whose content changes height in place (Bingo's tabs, the leaderboard filter) doesn't rescale it,
   * and neither does a phone's toolbar collapsing.
   */
  viewport?: boolean;
}) {
  // The background before the last change fades out over the new one, with CSS rather than Motion, which every page
  // would otherwise load for this. Reduced motion ends the fade at once (app.css).
  const [shown, setShown] = useState<{ background: BackgroundName; old?: BackgroundName }>({ background });
  if (shown.background !== background) setShown({ background, old: shown.background });

  const image = "absolute inset-0 size-full object-cover object-top";

  return (
    <div className={cn(viewport ? "fixed inset-x-0 top-0 h-lvh" : "absolute w-full", "pointer-events-none -z-50", className)}>
      <img
        src={src(background)}
        alt=""
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        className={image}
        style={{ mask }}
      />
      {shown.old && (
        <img
          key={`${shown.old}:${background}`}
          src={src(shown.old)}
          alt=""
          className={cn(image, "animate-fade-out")}
          style={{ mask }}
          onAnimationEnd={() => setShown({ background })}
        />
      )}
    </div>
  );
}

/**
 * A page's own background, fetched early and fixed behind the whole page, under the overlay that darkens it behind the
 * page's text. The header and footer are opaque, so it shows only between them.
 */
export function PageBackground({ background }: { background: BackgroundName }) {
  return (
    <>
      <Background background={background} priority viewport />
      <div className="fixed inset-x-0 top-0 h-lvh bg-[rgb(17_17_17_/0.7)] -z-10" />
    </>
  );
}
