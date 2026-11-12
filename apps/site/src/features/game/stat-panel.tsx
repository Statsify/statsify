/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BOX_GAP, BOX_RING, Box, CELL, HEADING_BOX, StatBox } from "~/components/ui/box";
import { Check } from "~/components/icons/check";
import { Chevron } from "~/components/icons/chevron";
import { Cross } from "~/components/icons/cross";
import { wordMatcher } from "~/components/filter-box";
import { Fragment, type ReactNode } from "react";
import { GameIcon, hasGameIcon } from "~/components/ui/game-icon";
import { Hint, Spoken } from "~/components/ui/hint";
import { Hidden, InlineStat, LeaderboardLink, StatCell, glossaryKey, linkHint, useStatName } from "~/components/ui/stat";
import { MinecraftText, colorOf } from "~/components/ui/minecraft-text";
import { StatInfo } from "./stat-info";
import { cn } from "~/lib/util";
import { LABEL_NAMESPACES } from "~/i18n/i18n";
import { useExactNumber, useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { StatCell as Stat, StatSection } from "@statsify/contract";

/** On a phone an odd row's last cell spans its row, centered, rather than sitting alone in the first column. */
const ODD_LAST = "max-sm:col-span-2";

/**
 * A table's columns by its widest row: up to two on phones (three in the headline, as on the card), and from `sm` up to
 * five, a longer row wrapping evenly (six as 3 + 3, seven as 4 + 3).
 */
const COLUMNS = [
  "grid-cols-1",
  "grid-cols-1",
  "grid-cols-snap-2",
  "grid-cols-snap-2 sm:grid-cols-snap-3",
  "grid-cols-snap-2 sm:grid-cols-snap-4",
  "grid-cols-snap-2 sm:grid-cols-snap-5",
];

const MOST_COLUMNS = COLUMNS.length - 1;

/** The table's columns, and whether a phone pairs up the cells of a wider row (so an odd row's last spans, `ODD_LAST`). */
const columnsOf = (count: number, headline: boolean) => {
  if (headline && count === 3) return { columns: "grid-cols-snap-3", pairs: false };
  const index = count <= MOST_COLUMNS ? count : Math.ceil(count / Math.ceil(count / MOST_COLUMNS));
  return { columns: COLUMNS[index], pairs: index >= 3 };
};

/**
 * Every row of a section takes the columns of its widest, so the cells line up down the table and a short row leaves
 * its last columns blank (Duels' two winstreaks over Wins and Losses).
 */
const sectionColumns = (rows: Stat[][]) =>
  Math.max(0, ...rows.filter((row) => !row.every((cell) => cell.inline)).map((row) => row.length));

/** A section's heading: the site's or the card's word for it, or the card's own Minecraft-formatted heading. */
export function SectionTitle({ section }: { section: StatSection }) {
  const { t } = useTranslation();
  if (section.name) return <MinecraftText>{section.name}</MinecraftText>;
  if (section.title === null) return null;
  const { className, style } = colorOf(section.color ?? "§f");
  return <span className={className} style={style}>{t(section.title, { ns: LABEL_NAMESPACES })}</span>;
}

/** A heading over one of a panel's rows, at the section heading's size in a taller box, as the card draws it. */
const ROW_HEADING_BOX = cn(HEADING_BOX, "content:py-3");

/**
 * A panel of stats as the card draws it: the section's heading in a box across it when it has one, then the card's
 * rows, every stat its own box with the card's gaps between them. A list (maps, challenges) is name and value lines in
 * columns of boxes instead, and a long one starts folded behind its heading and count. A list the page's filter
 * searches keeps the lines whose name matches, and opens while it filters.
 */
export function StatPanel({
  section,
  username,
  headline = false,
  filter,
  className,
}: {
  section: StatSection;
  username: string;
  /** The page's first table, whose rows of three keep three columns on a phone, as on the card. */
  headline?: boolean;
  /** The page's filter, for a list it searches. */
  filter?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  const labelText = useLabelText();
  const heading = section.title === null && !section.name ?
    undefined :
    <h2 className="text-mc-1.5 font-bold"><SectionTitle section={section} /></h2>;

  if (section.list) {
    const all = section.rows.flat();
    const filtering = filter !== undefined && filter.trim() !== "";
    const matches = wordMatcher(filter ?? "");
    const shown = (cells: Stat[]) => (filtering ? cells.filter((cell) => matches(labelText(cell))) : cells);
    const cells = shown(all);
    // Each line its own box, holding a `<dl>` of that line: a `<dl>` can't hold the box's own wrappers. A list whose
    // lines pair up on a phone takes narrower sides there, which "Floating Islands 10.008s" needs at 375.
    const lines = (cells: Stat[]) => (
      <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", section.pairs ? "grid-cols-2" : "grid-cols-1", BOX_GAP)}>
        {cells.map((cell) => (
          <Box key={cell.key} className={cn(CELL, "content:py-1.5", section.pairs && "max-sm:content:px-2")}>
            <dl className="min-w-0 grow">
              <ListStat cell={cell} username={username} plain={section.plain} ticks={section.ticks} />
            </dl>
          </Box>
        ))}
      </div>
    );
    const { rowNames } = section;
    // Under the card's own headings (Dropper's difficulties), a row at a time; one the filter empties goes with its heading.
    const list = rowNames ?
      (
        <div className={cn("flex flex-col", BOX_GAP)}>
          {section.rows.map((row, index) => {
            const kept = shown(row);
            return kept.length > 0 && (
              <Fragment key={index}>
                <Box className={ROW_HEADING_BOX}><h3 className="text-mc-2"><MinecraftText>{rowNames[index]}</MinecraftText></h3></Box>
                {lines(kept)}
              </Fragment>
            );
          })}
        </div>
      ) :
      lines(cells);

    if (!section.collapsed) {
      return (
        <div className={cn("flex flex-col", BOX_GAP, className)}>
          {heading && <Box className={HEADING_BOX}>{heading}</Box>}
          {list}
        </div>
      );
    }

    return (
      <details open={filtering} className={cn("group", className)}>
        <Box
          as="summary"
          className={cn(CELL, BOX_RING, "cursor-pointer list-none content:justify-start content:gap-2 [&::-webkit-details-marker]:hidden")}
        >
          <Chevron className="size-6 shrink-0 text-mc-gray transition-transform group-open:rotate-90" />
          <h2 className="text-mc-1.5 font-bold"><SectionTitle section={section} /></h2>
          <span className="text-mc-1.5 text-mc-gray">
            ({filtering ? t("filter.count", { shown: n(cells.length), total: n(all.length) }) : n(all.length)})
          </span>
        </Box>
        <div className="pt-1">{list}</div>
      </details>
    );
  }

  // A row's heading sits under the panel's, or takes its level where the panel has none (the headline table).
  const RowHeading = heading ? "h3" : "h2";

  const { columns, pairs } = columnsOf(sectionColumns(section.rows), headline);

  // One grid for the whole panel, so the headings' boxes end where the cells' columns do; each row starts a new line.
  return (
    <div className={cn("grid", BOX_GAP, columns, className)}>
      {heading && <Box className={HEADING_BOX}>{heading}</Box>}
      {section.rows.map((row, index) => {
        const title = section.rowTitles?.[index];

        return (
          <Fragment key={index}>
            {/* A row under a heading (Final, Normal) whose cells drop the word it says. */}
            {title && <Box className={ROW_HEADING_BOX}><RowHeading className="text-mc-2">{t(title)}</RowHeading></Box>}
            {row.every((cell) => cell.inline) ?
              // The card's selections (kit, class) are lines in one box, as on its sidebar.
              (
                <Box className={cn(CELL, "col-span-full content:justify-start content:py-2")}>
                  <dl className="flex flex-col gap-2">
                    {row.map((cell) => <SelectionStat key={cell.key} cell={cell} />)}
                  </dl>
                </Box>
              ) :
              row.map((cell, column) => (
                <StatBox
                  key={cell.key}
                  className={cn(
                    column === 0 && "col-start-1",
                    pairs && row.length % 2 === 1 && column === row.length - 1 && ODD_LAST
                  )}
                >
                  <GameStat cell={cell} username={username} />
                </StatBox>
              ))}
          </Fragment>
        );
      })}
    </div>
  );
}

/**
 * A stat's heading: the card's own name for it (in its colors, else the stat's), or the bot's word for it, with the
 * full name where that word shortens one (FKDR).
 */
export function useStatLabel(cell: Stat): { text: string; node: ReactNode; full?: string } {
  const text = useLabelText()(cell);
  const full = useStatName()(cell.label);
  if (cell.name !== undefined) return { text, node: <MinecraftText>{`${cell.color}${cell.name}`}</MinecraftText> };
  return { text, node: text, full };
}

const plainName = (name: string) => name.replaceAll(/§#[\dA-Fa-f]{6}|§./g, "");

/** A stat's heading as plain text, for its link and the filter: the card's own name, or the label's words. */
export function useLabelText(): (cell: Stat) => string {
  const { t } = useTranslation();
  return (cell) => (cell.name === undefined ? t(cell.label, { ns: LABEL_NAMESPACES, ...cell.params }) : plainName(cell.name));
}

/**
 * A stat's value as the card prints it: a number in the locale's format (with its cap or unit), or the API's text. A
 * number the format shortens carries the exact one, as a `Hint`, or under a link only for screen readers, since the
 * link shows it.
 */
export function useStatValue(cell: Stat, linked = false): ReactNode {
  const n = useNumberFormat(cell.trim);
  const exact = useExactNumber();
  const Short = linked ? Spoken : Hint;
  const number = (value: number) => <Short full={exact(value)}>{n(value)}</Short>;
  if (cell.hidden) return <Hidden />;
  // Text the API formatted takes the stat's color, unless it brings its own (a level, a §7 N/A).
  const value = typeof cell.value === "number" ?
    <>{number(cell.value)}{cell.suffix ?? ""}</> :
    <MinecraftText>{`${cell.color}${cell.value}`}</MinecraftText>;

  if (cell.of === undefined) return value;

  return (
    <>
      {value}
      <span className="text-mc-1 text-mc-gray">/{number(cell.of)}</span>
    </>
  );
}

/**
 * One stat as the card draws it, in its color, with the bot's label. A capped stat shows its cap after it (`12/25`) in
 * §7 like the card, at the label's size so the pair fits a phone's cell.
 */
function GameStat({ cell, username }: { cell: Stat; username: string }) {
  const { t } = useTranslation();
  const exact = useExactNumber();
  const label = useStatLabel(cell);
  const value = useStatValue(cell, cell.leaderboard !== undefined);
  const { className, style } = colorOf(cell.color);
  // The short label shows under the row's heading; the link keeps the whole name.
  const shown = cell.short ? t(cell.short, { ns: LABEL_NAMESPACES }) : label.node;
  // Explained in place: an abbreviation, and a stat that means something else in this game.
  const glossary = cell.glossary ?? (label.full === undefined ? undefined : glossaryKey(cell.label));

  return (
    <StatCell
      label={cell.leaderboard ? <Spoken full={label.full}>{shown}</Spoken> : <Hint full={label.full}>{shown}</Hint>}
      info={glossary && <StatInfo glossary={glossary} label={label.text} />}
      value={cell.leaderboard ?
        (
          <LeaderboardLink
            field={cell.leaderboard}
            username={username}
            stat={label.full ?? label.text}
            hint={linkHint(label.full, typeof cell.value === "number" ? exact(cell.value) : undefined)}
          >
            {value}
          </LeaderboardLink>
        ) :
        value}
      color={className}
      style={style}
      className="relative grow"
    />
  );
}

/**
 * A name and its value on one line, as the card's lists draw them: the name on the left, bold unless the list keeps the
 * card's own formatting, and the value on the right, or a tick or a cross in a list of things done or not.
 */
function ListStat({ cell, username, plain = false, ticks = false }: { cell: Stat; username: string; plain?: boolean; ticks?: boolean }) {
  const exact = useExactNumber();
  const label = useStatLabel(cell);
  const count = useStatValue(cell, cell.leaderboard !== undefined);
  const value = ticks ? <Tick done={Number(cell.value) > 0} /> : count;
  const { className, style } = colorOf(cell.color);

  return (
    // 32 px tall in its box's 6 px sides, so the link's area (6 px past it) and its ring end at the box's edge.
    <div className={cn("relative flex min-h-8 min-w-0 items-center gap-2 text-mc-1", className)} style={style}>
      {/* The icon inside the term, since a <dl>'s rows hold only terms and values. */}
      <dt className={cn("flex min-w-0 grow items-center gap-2", !plain && "font-bold")}>
        {cell.icon && hasGameIcon(cell.icon) && <span aria-hidden className="size-8 shrink-0"><GameIcon game={cell.icon} /></span>}
        <span className="mc-crisp min-w-0 truncate">
          {cell.leaderboard ? <Spoken full={label.full}>{label.node}</Spoken> : <Hint full={label.full}>{label.node}</Hint>}
        </span>
      </dt>
      <dd className="mc-crisp shrink-0">
        {cell.leaderboard ?
          (
            <LeaderboardLink
              field={cell.leaderboard}
              username={username}
              stat={label.full ?? label.text}
              hint={linkHint(label.full, !ticks && typeof cell.value === "number" ? exact(cell.value) : undefined)}
            >
              {value}
            </LeaderboardLink>
          ) :
          value}
      </dd>
    </div>
  );
}

/** The card's tick or cross, in the stat's color, with its words for screen readers. */
function Tick({ done }: { done: boolean }) {
  const { t } = useTranslation();
  const Icon = done ? Check : Cross;

  return (
    <>
      <Icon className="block size-6" />
      <span className="sr-only">{t(done ? "game.done" : "game.notDone")}</span>
    </>
  );
}

/** A selection the card shows (a kit, a trail) as `§7Label: value`, never a link. */
function SelectionStat({ cell }: { cell: Stat }) {
  const label = useStatLabel(cell);
  const value = useStatValue(cell);
  const { className, style } = colorOf(cell.color);
  return <InlineStat label={<Hint full={label.full}>{label.text}</Hint>} value={value} color={className} style={style} />;
}
