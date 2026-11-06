/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";
import { ComponentProps } from "react";
import { cn } from "~/lib/util";

export function Skin({ uuid, className = "", ...props }: ComponentProps<typeof Box> & { uuid: string }) {
  return (
    <Box {...props} className={`content:relative content:flex content:justify-center content:min-w-[180px] content:h-full ${className}`}>
      <img
        src={`/api/skin/render?uuid=${uuid}`}
        // Decorative: the player's name is always next to it.
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-top object-cover pointer-events-none"
      />
    </Box>
  );
}

/**
 * A player's face, `size` px square. The image is always the 8×8 face and the browser scales it up without
 * smoothing, so every size shares one cached image per player. By `name` it's a search suggestion's head: only the
 * skin the API has stored for that name.
 */
export function SkinHead({
  size = 32,
  className,
  ...player
}: ({ uuid: string } | { name: string }) & { size?: number; className?: string }) {
  return (
    <img
      height={size}
      width={size}
      alt=""
      loading="lazy"
      decoding="async"
      src={"uuid" in player ? `/api/skin/head?uuid=${player.uuid}` : `/api/skin/head?name=${encodeURIComponent(player.name)}`}
      style={{ imageRendering: "pixelated" }}
      className={className}
    />
  );
}

/** The top of the full-body render, height-cropped: the bust in profile blocks and result cards. */
export function SkinBust({ uuid, className }: { uuid: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={`/api/skin/render?uuid=${uuid}`}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-x-0 top-0 w-full object-top pointer-events-none"
      />
    </div>
  );
}
