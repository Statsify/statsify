/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BOX_GAP, Box, CELL, HEADING_BOX, StatBox } from "~/components/ui/box";
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
import type { ReactNode } from "react";

export type Pair = { a: Stat; b: Stat };

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
 * Two players' pages of one game, each table as a leaderboard's rows, one per player. The nametags link to each player's
 * own page of the game; the game nav and mode switcher keep to the comparison.
 */
export function CompareView({ a, b }: { a: GamePage; b: GamePage }) {
  const { t } = useTranslation();
  const scope: GameScope = { kind: "compare", a: a.username, b: b.username };
  const games = a.games.map((game) => ({ ...game, played: game.played || b.games.some(({ key, played }) => played && key === game.key) }));
  const page = { ...a, games, modes: unmarked(a.modes), submodes: unmarked(a.submodes) };
  const sides: Sides = [<PlayerRowName key="a" page={a} />, <PlayerRowName key="b" page={b} />];

  return (
    <div className="relative grow">
      <PageBackground background={backgroundFor(a.game.key)} />
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
          <CompareSection
            key={section?.title ?? section?.name ?? index}
            title={section && (section.title !== null || section.name) && <SectionTitle section={section} />}
            pairs={pairs}
            sides={sides}
          />
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

function PlayerRowName({ page }: { page: GamePage }) {
  return (
    <>
      <SkinHead uuid={page.uuid} size={24} className="shrink-0" />
      <h3 className="min-w-0 wrap-anywhere text-mc-1.5"><MinecraftText>{page.displayName}</MinecraftText></h3>
    </>
  );
}

/** What starts each side's row: the player's or guild's name, in the first page's order. */
export type Sides = [ReactNode, ReactNode];

/** A row's columns: three across a phone at most (two for four), and up to six from `md`. */
const COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-3 md:grid-cols-5",
};

const columnsFor = (count: number) => COLUMNS[count] ?? "grid-cols-3 md:grid-cols-6";

/**
 * A table of a comparison as a leaderboard's rows: its heading, when it has one, then for each side its name across the
 * row and a box per stat. Both rows share their columns, so a stat sits over the same stat of the other side.
 */
export function CompareSection({ title, pairs, sides }: { title?: ReactNode; pairs: Pair[]; sides: Sides }) {
  return (
    <section className={cn("flex flex-col", BOX_GAP)}>
      {title && <Box className={HEADING_BOX}><h2 className="text-mc-1.5 font-bold">{title}</h2></Box>}
      <div className="flex flex-col gap-2">
        {sides.map((side, index) => (
          <div key={index} className={cn("grid", BOX_GAP, columnsFor(pairs.length))}>
            <Box className={cn(CELL, "col-span-full content:gap-2 content:px-2")}>{side}</Box>
            {pairs.map(({ a, b }) => index === 0 ? <CompareStat key={a.key} cell={a} other={b} /> : <CompareStat key={b.key} cell={b} other={a} />)}
          </div>
        ))}
      </div>
    </section>
  );
}

/** A stat's label over its value, the higher with how far it leads, in grey: higher isn't always better. */
function CompareStat({ cell, other }: { cell: Stat; other: Stat }) {
  const label = useStatLabel(cell);
  const value = useStatValue(cell);
  const { className, style } = colourOf(cell.colour);
  const by = lead(cell, other);

  return (
    <StatBox>
      <div className="flex min-w-0 grow flex-col items-center justify-end gap-1 text-center">
        <dt className={cn("max-w-full text-mc-1.5 text-balance wrap-break-word", className)} style={style}>
          <Hint full={label.full}>{label.node}</Hint>
        </dt>
        <dd className="flex max-w-full flex-wrap items-baseline justify-center gap-x-2 text-mc-1.5 lg:text-mc-2">
          <span className="mc-crisp min-w-0 wrap-break-word">{value}</span>
          {by > 0 && <Difference value={by} suffix={cell.suffix} className="ms-0 whitespace-nowrap text-mc-gray" />}
        </dd>
      </div>
    </StatBox>
  );
}
