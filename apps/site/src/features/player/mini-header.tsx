/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MinecraftText } from "~/components/ui/minecraft-text";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { type RefObject, useEffect, useState } from "react";

/**
 * On phones, once the nametag (`watch`) has scrolled off the top, a bar pinned there with the head, rank and name, and
 * the game on a game page. It repeats the page's heading, so screen readers skip it.
 */
export function MiniHeader({
  watch,
  uuid,
  name,
  game,
}: {
  watch: RefObject<HTMLElement | null>;
  uuid: string;
  name: string;
  game?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const nametag = watch.current;
    if (!nametag) return;

    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0));
    observer.observe(nametag);
    return () => observer.disconnect();
  }, [watch]);

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-11 items-center gap-4 bg-blackify-800 px-4 text-mc-1 text-mc-white shadow-[0_4px_0_rgb(0_0_0/0.84)] md:hidden",
        !shown && "hidden"
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <SkinHead uuid={uuid} size={24} className="shrink-0" />
        <span className="min-w-0 truncate">
          <MinecraftText>{name}</MinecraftText>
        </span>
      </span>
      {game && (
        <span className="ms-auto shrink-0">
          <MinecraftText>{game}</MinecraftText>
        </span>
      )}
    </div>
  );
}
