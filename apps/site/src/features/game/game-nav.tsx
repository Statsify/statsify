/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Chevron } from "~/components/icons/chevron";
import { GameIcon, hasGameIcon, pageIcon } from "~/components/ui/game-icon";
import { Link } from "@tanstack/react-router";
import { Menu } from "~/components/icons/menu";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { cn } from "~/lib/util";
import { type GameScope, gameLink } from "./game-data";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { GamePage } from "@statsify/contract";

type NavGame = GamePage["games"][number];

/** A game's icon, its name, and words for screen readers when the player has never played it. */
function GameName({ game }: { game: NavGame }) {
  const { t } = useTranslation();
  const icon = pageIcon(game.id, game.key);

  return (
    <>
      {icon && hasGameIcon(icon) && <span aria-hidden className="size-6 shrink-0"><GameIcon game={icon} /></span>}
      <MinecraftText className="min-w-0">{game.name}</MinecraftText>
      {!game.played && <span className="sr-only"> {t("game.unplayed")}</span>}
    </>
  );
}

/**
 * The player's game pages: a Games button over a grid of them. The button is a `<details>`, so it opens before the page
 * hydrates. The grid takes the width of the nearest positioned ancestor.
 */
export function GameNav({
  games,
  scope,
  current,
  open,
  wide = false,
  className,
}: {
  games: NavGame[];
  scope: GameScope;
  /** The key of the game page it's on. */
  current?: string;
  open?: boolean;
  /** The button as wide as its row, its label shown on phones too: a row of its own, with no tabs beside it. */
  wide?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const details = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (details.current) details.current.open = false;
  };

  useEffect(() => {
    const element = details.current;
    if (!element) return;

    const outside = (event: PointerEvent) => {
      if (element.open && !element.contains(event.target as Node)) element.open = false;
    };
    // Back to the button, so the keyboard carries on from where the grid opened.
    const escape = (event: KeyboardEvent) => {
      if (!element.open || event.key !== "Escape") return;
      element.open = false;
      element.querySelector("summary")?.focus();
    };
    // Tabbing out closes it, so it never lies over the element with focus. Focus going nowhere (a click on the page) is
    // the pointerdown's to judge, so a click on the grid's padding leaves it open.
    const blur = (event: FocusEvent) => {
      if (element.open && event.relatedTarget instanceof Node && !element.contains(event.relatedTarget)) element.open = false;
    };

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    element.addEventListener("focusout", blur);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      element.removeEventListener("focusout", blur);
    };
  }, []);

  const ariaCurrent = (game: NavGame) => (game.key === current ? "page" : undefined);

  return (
    <nav aria-label={t("game.games")} className={className}>
      <details ref={details} open={open} className={cn("group/games", wide ? "w-full" : "w-fit")}>
        <summary
          className={cn(
            "flex h-11 cursor-pointer list-none items-center gap-2 bg-blackify-800 ps-3 pe-2 text-mc-1.5 text-white select-none focus-visible:focus-ring-inset [&::-webkit-details-marker]:hidden",
            wide && "justify-between"
          )}
        >
          {/* A square on phones, so it fits beside the mode tabs. */}
          <span className={cn(!wide && "max-md:sr-only")}>{t("game.games")}</span>
          {!wide && <Menu className="size-6 text-mc-gray md:hidden" />}
          <Chevron className={cn("size-6 rotate-90 text-mc-gray group-open/games:-rotate-90", !wide && "max-md:hidden")} />
        </summary>
        {/* Opaque, as the selects are, since it lies over the stats; the shadow is the panels'. */}
        <div className="absolute inset-x-0 top-full z-10 mt-2 bg-blackify-800 p-2 shadow-[4px_4px_0_rgb(0_0_0/0.84)]">
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {games.map((game) => (
              <li key={game.key}>
                <Link
                  {...gameLink(scope, game.key)}
                  aria-current={ariaCurrent(game)}
                  onClick={close}
                  className={cn(
                    "flex min-h-11 items-center gap-2 px-2 text-mc-1 hover:bg-white/10 focus-visible:focus-ring-inset aria-[current=page]:bg-white/15 aria-[current=page]:font-bold",
                    !game.played && "opacity-50"
                  )}
                >
                  <GameName game={game} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </nav>
  );
}
