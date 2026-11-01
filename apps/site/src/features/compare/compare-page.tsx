/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BOX_GAP, Box, CELL, HEADING_BOX } from "~/components/ui/box";
import { Difference } from "~/components/ui/stat";
import { Hint } from "~/components/ui/hint";
import { Link } from "@tanstack/react-router";
import { MinecraftText, colourOf } from "~/components/ui/minecraft-text";
import { GameSwitchers } from "~/features/game/mode-switcher";
import { PageBackground, backgroundFor } from "~/components/ui/background";
import { SectionTitle, useStatLabel, useStatValue } from "~/features/game/stat-panel";
import { SkinHead } from "~/components/ui/skin";
import { type GameScope, gameLink, headingText, pageSearch } from "~/features/game/game-data";
import { cn } from "~/lib/util";
import { useTranslation } from "react-i18next";
import type { GamePage, StatCell as Stat, StatSection } from "@statsify/contract";

type Pair = { a: Stat; b: Stat };

/**
 * The stats both pages show, paired by key in the first page's order: the game-wide row, then each table. Lists (maps,
 * titles) and selections (a kit) are left out, as two players' lists differ and a selection has no difference.
 */
export function comparePairs(a: GamePage, b: GamePage): { section?: StatSection; pairs: Pair[] }[] {
  const others = new Map([...b.overview, ...b.sections.flatMap((section) => section.rows.flat())].map((cell) => [cell.key, cell]));
  const pair = (cells: Stat[]) =>
    cells.flatMap((cell) => {
      const other = others.get(cell.key);
      return cell.inline || !other ? [] : [{ a: cell, b: other }];
    });

  return [
    { pairs: pair(a.overview) },
    ...a.sections.filter((section) => !section.list).map((section) => ({ section, pairs: pair(section.rows.flat()) })),
  ].filter(({ pairs }) => pairs.length > 0);
}

/** A switcher's modes without the marks: the mode one player played most says nothing about the other. */
const unmarked = (options: GamePage["modes"]) => options.map(({ key, name }) => ({ key, name }));

/** How far a value is above the other's: 0 for text, a hidden value, or one that isn't higher. */
const lead = (cell: Stat, other: Stat) =>
  typeof cell.value === "number" && typeof other.value === "number" && !cell.hidden && !other.hidden ? Math.max(cell.value - other.value, 0) : 0;

/**
 * Two players' pages of one game, stat by stat: each stat's label over both values, the higher with how far it leads.
 * The nametags link to each player's own page of the game; the game nav and mode switcher keep to the comparison.
 */
export function CompareView({ a, b }: { a: GamePage; b: GamePage }) {
  const { t } = useTranslation();
  const scope: GameScope = { kind: "compare", a: a.username, b: b.username };
  const games = a.games.map((game) => ({ ...game, played: game.played || b.games.some(({ key, played }) => played && key === game.key) }));
  const page = { ...a, games, modes: unmarked(a.modes), submodes: unmarked(a.submodes) };

  return (
    <div className="relative grow">
      <PageBackground background={backgroundFor(a.game.key)} viewport mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className={cn("grid grid-cols-2", BOX_GAP)}>
          <CompareNametag page={a} />
          <CompareNametag page={b} end />
          <Box as="h1" className={cn(HEADING_BOX, "content:text-mc-2")}>
            <span className="sr-only">{t("compare.versus", { a: a.username, b: b.username })} · </span>
            <MinecraftText>{headingText(a, (key) => t(key))}</MinecraftText>
          </Box>
        </div>
        <GameSwitchers page={page} scope={scope} />
        {comparePairs(a, b).map(({ section, pairs }, index) => (
          <section key={section?.title ?? section?.name ?? index} className={cn("flex flex-col", BOX_GAP)}>
            {section && (section.title !== null || section.name) && (
              <Box className={HEADING_BOX}><h2 className="text-mc-1.5 font-bold"><SectionTitle section={section} /></h2></Box>
            )}
            <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", BOX_GAP)}>
              {pairs.map((pair) => <CompareStat key={pair.a.key} {...pair} names={[a.username, b.username]} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** A player's head, name and level in the game; the name links to their own page of it, in the mode shown. */
function CompareNametag({ page, end = false }: { page: GamePage; end?: boolean }) {
  return (
    <Box className={cn("content:flex content:items-center content:gap-3", end && "content:flex-row-reverse content:text-end")}>
      <SkinHead uuid={page.uuid} className="size-8 shrink-0 sm:size-12" />
      <div className="flex min-w-0 flex-col gap-1">
        <Link {...gameLink({ kind: "player", name: page.username }, page.game.key)} search={pageSearch(page)} className="wrap-break-word text-mc-1.5 hover:underline">
          <MinecraftText>{page.displayName}</MinecraftText>
        </Link>
        {page.level && <MinecraftText className="text-mc-1.5">{page.level.current}</MinecraftText>}
      </div>
    </Box>
  );
}

/** A stat's label over both players' values, the higher with how far it leads, in grey: higher isn't always better. */
function CompareStat({ a, b, names }: Pair & { names: [string, string] }) {
  const label = useStatLabel(a);
  const { className, style } = colourOf(a.colour);

  return (
    <div className={cn("grid grid-cols-2", BOX_GAP)}>
      <Box className={HEADING_BOX}>
        <p className={cn("text-mc-1", className)} style={style}><Hint full={label.full}>{label.node}</Hint></p>
      </Box>
      <CompareValue cell={a} other={b} name={names[0]} />
      <CompareValue cell={b} other={a} name={names[1]} />
    </div>
  );
}

function CompareValue({ cell, other, name }: { cell: Stat; other: Stat; name: string }) {
  const value = useStatValue(cell);
  const { className, style } = colourOf(cell.colour);
  const by = lead(cell, other);

  return (
    <Box className={cn(CELL, "content:flex-col content:justify-start content:gap-1 content:text-center")}>
      <p className={cn("max-w-full text-mc-2 wrap-break-word", className)} style={style}>
        <span className="sr-only">{name}: </span>
        {value}
      </p>
      {by > 0 && <Difference value={by} suffix={cell.suffix} className="ms-0 text-mc-gray" />}
    </Box>
  );
}
