/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box, CELL } from "~/components/ui/box";
import { Chevron } from "~/components/icons/chevron";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { Link } from "@tanstack/react-router";
import { Menu } from "~/components/icons/menu";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { cn } from "~/lib/util";
import { type GameScope, gameLink } from "./game-data";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { GamePage } from "@statsify/contract";

/** From `md` up, the game nav lists up to this many pages as links; past it, the Games button, as on phones. */
const DESKTOP_GAMES = 10;

type NavGame = GamePage["games"][number];

/** A game's icon, its name, and words for screen readers when the player has never played it. */
function GameName({ game }: { game: NavGame }) {
  const { t } = useTranslation();

  return (
    <>
      {game.id && hasGameIcon(game.id) && <span aria-hidden className="size-6 shrink-0"><GameIcon game={game.id} /></span>}
      <MinecraftText className="min-w-0">{game.name}</MinecraftText>
      {!game.played && <span className="sr-only"> {t("game.unplayed")}</span>}
    </>
  );
}

/**
 * The player's game pages, in the game registry's order. On phones, and from `md` up past `DESKTOP_GAMES`, a Games
 * button opens a grid of them over the page; up to it, a link each from `md` up. The button is a `<details>`, so it
 * opens before the page hydrates; after, Escape, a pick, a tap outside or tabbing out closes it. The `current` game is
 * marked, and a game the player has never played is dimmed and says so. The grid takes the width of the nearest
 * positioned ancestor. Its own file, so the profile can show it without the game page's code.
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
  const links = games.length <= DESKTOP_GAMES;
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
    <nav aria-label={t("game.games")} className={cn(links && "md:basis-full", className)}>
      <details ref={details} open={open} className={cn("group/games", wide ? "w-full" : "w-fit", links && "md:hidden")}>
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
      {links && (
        <ul className="hidden flex-wrap gap-x-1 gap-y-2 md:flex">
          {games.map((game) => (
            <li key={game.key}>
              <Link
                {...gameLink(scope, game.key)}
                aria-current={ariaCurrent(game)}
                className="group block"
              >
                <Box
                  className={cn(
                    CELL,
                    "group-hover:brightness-125 content:justify-start content:gap-2 content:py-0 content:text-mc-1 group-aria-[current=page]:font-bold",
                    !game.played && "opacity-50"
                  )}
                >
                  <GameName game={game} />
                </Box>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
