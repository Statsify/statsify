/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { cn } from "~/lib/util";
import { type ComponentProps, useState } from "react";

// The nine public backgrounds in `public/backgrounds/`; the private blurred set never ships. They are
// pre-blurred WebP (about 18 KB each), so no backdrop filter runs on top of them.
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
   * Size the image to the viewport instead of the content, for pages whose content changes height in place (Bingo's
   * tabs, the leaderboard filter, search results). A content-sized image would rescale and shift with every change.
   */
  viewport?: boolean;
}) {
  // The background before the last change fades out over the new one, with CSS rather than Motion, which every page
  // would otherwise load for this. Reduced motion ends the fade at once (app.css).
  const [shown, setShown] = useState<{ background: BackgroundName; old?: BackgroundName }>({ background });
  if (shown.background !== background) setShown({ background, old: shown.background });

  const image = viewport
    ? "absolute inset-x-0 top-0 h-svh w-full object-cover object-top"
    : "absolute inset-0 size-full object-cover object-top";

  return (
    <div className={cn("absolute w-full pointer-events-none -z-50", viewport && "overflow-hidden", className)}>
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

/** A page's own background, fetched early, under the overlay that darkens it behind the page's text. */
export function PageBackground({ className = "h-full", ...props }: Omit<ComponentProps<typeof Background>, "priority">) {
  return (
    <>
      <Background {...props} priority className={className} />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
    </>
  );
}
