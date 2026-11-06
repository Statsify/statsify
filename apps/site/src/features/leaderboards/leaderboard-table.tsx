/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { useId } from "react";
import { Hint } from "~/components/ui/hint";
import { Link, useNavigate } from "@tanstack/react-router";
import { MinecraftText, colourOf } from "~/components/ui/minecraft-text";
import { Search } from "~/components/search";
import { formatPosition } from "@statsify/profiles/format-position";
import { StatNumber, useStatName } from "~/components/ui/stat";
import { useExactNumber, useNumberFormat } from "~/i18n/use-number-format";
import { Trans, useTranslation } from "react-i18next";
import { LABEL_NAMESPACES } from "~/i18n/i18n";
import { type AroundMiss, PAGE_SIZE } from "./leaderboard-data";
import type { ReactNode } from "react";
import type { LeaderboardColumn, LeaderboardPage } from "@statsify/contract";

/** A row's name: a link to the player's page for the board's game and mode where there is one, else to the profile. */
export function PlayerLink({ page, name, className, children }: { page: LeaderboardPage; name: string; className?: string; children: ReactNode }) {
  const target = page.gamePage;
  if (!target) return <Link to="/{-$locale}/player/$name" params={{ name }} className={className}>{children}</Link>;

  return (
    <Link
      to="/{-$locale}/player/$name/$game"
      params={{ name, game: target.game }}
      search={{ mode: target.mode, submode: target.submode }}
      className={className}
    >
      {children}
    </Link>
  );
}

/**
 * A column's label: the catalog's word for the stat, or the leaderboard's own name for the column where the catalog has
 * none or its word needs a value (The Pit's "Tier {{tier}}").
 */
export function useColumnLabel(): (column: LeaderboardColumn) => string {
  const { t } = useTranslation();

  return (column) => {
    const label = column.label ? t(column.label, { ns: LABEL_NAMESPACES, defaultValue: column.name }) : column.name;
    return label.includes("{{") ? column.name : label;
  };
}

/**
 * A column's label in the colour the bot's cards give its stat, where that doesn't depend on the value, with the full
 * name where the label shortens one (FKDR).
 */
export function ColumnLabel({ column }: { column: LeaderboardColumn }) {
  const text = useColumnLabel()(column);
  const statName = useStatName();
  return (
    <Hint full={column.label ? statName(column.label) : undefined}>
      {column.colour ? <span {...colourOf(column.colour)}>{text}</span> : text}
    </Hint>
  );
}

/** A value as the bot prints it: a number in its format (`StatNumber`), or the API's text (a time). */
export function Value({ value }: { value: string | number }) {
  return typeof value === "number" ? <StatNumber value={value} /> : value;
}

/** A row's position as the bot prints it, with the exact one where the number format shortens it (#1.00M). */
export function Position({ position, className }: { position: number; className: string }) {
  const n = useNumberFormat();
  const exact = useExactNumber()(position);

  return (
    <Hint full={exact && `#${exact}`}>
      <MinecraftText className={className}>{formatPosition(position, n)}</MinecraftText>
    </Hint>
  );
}

/**
 * Previous and next page links around the page count; the links drop `around`. Under a stream of pages, `page` is its
 * first and `last` its last, and the links go past them.
 */
export function PageNav({ field, page, last = page, pages }: { field: string; page: number; last?: number; pages: number }) {
  const { t } = useTranslation();
  const n = useNumberFormat();

  const pageLink = (target: number, label: string, disabled: boolean) => (
    <Button asChild size="small" className="min-w-32 sm:min-w-40">
      <Link
        to="/{-$locale}/leaderboards/$field"
        params={{ field }}
        // URLs count pages from 1, as the page count does; the first page has no `?page=`.
        search={{ page: target > 0 ? target + 1 : undefined }}
        preload={false}
        disabled={disabled}
        aria-disabled={disabled}
      >
        {label}
      </Link>
    </Button>
  );

  return (
    // Phones put the page count above the two buttons, so nothing wraps or overflows.
    <nav className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2" aria-label={t("leaderboards.pages")}>
      {pageLink(page - 1, t("leaderboards.previous"), page <= 0)}
      <p className="order-first basis-full text-mc-1 whitespace-nowrap text-center sm:order-none sm:basis-auto sm:text-mc-1.5">
        {last > page
          ? t("leaderboards.pageRange", { first: n(page + 1), last: n(last + 1), pages: n(pages) })
          : t("leaderboards.page", { page: n(page + 1), pages: n(Math.max(pages, 1)) })}
      </p>
      {pageLink(last + 1, t("leaderboards.next"), last + 1 >= pages)}
    </nav>
  );
}

/**
 * The `around=<name>` entry, the shared search box submitting into this leaderboard's query string, and beside it (below
 * on phones) the `position=<n>` one.
 */
export function FindPlayer({ field, pages, miss }: { field: string; pages: number; miss?: AroundMiss }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex w-full max-w-200 flex-col gap-2 self-center">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Search
          compact
          recent
          className="w-full"
          placeholder={t("leaderboards.find")}
          onSelect={(name) => navigate({ to: "/{-$locale}/leaderboards/$field", params: { field }, search: { around: name } })}
        />
        <JumpTo field={field} pages={pages} />
      </div>
      {miss && (
        <p className="text-mc-1 text-mc-yellow text-center">
          {miss.kind === "unknown" ? (
            <Trans
              i18nKey="leaderboards.unknown"
              values={{ name: miss.name }}
              components={{ profile: <Link to="/{-$locale}/player/$name" params={{ name: miss.name }} className="underline" /> }}
            />
          ) : (
            t(miss.kind === "moved" ? "leaderboards.moved" : "leaderboards.unranked", { name: miss.name })
          )}
        </p>
      )}
    </div>
  );
}

/**
 * Opens the page holding a position, with its row marked: rank 5,000 in one step rather than 200 Nexts. A plain GET
 * form (`?position=`), so it works without scripts; with them it navigates in place.
 */
function JumpTo({ field, pages }: { field: string; pages: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const id = useId();

  return (
    <form
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        const position = Number(new FormData(event.currentTarget).get("position"));
        void navigate({ to: "/{-$locale}/leaderboards/$field", params: { field }, search: { position } });
      }}
      className="flex shrink-0 items-center gap-2 self-center"
    >
      <label htmlFor={id} className="text-mc-1 text-mc-gray">{t("leaderboards.jump")}</label>
      <input
        id={id}
        aria-label={t("leaderboards.jumpPosition")}
        name="position"
        type="number"
        inputMode="numeric"
        required
        min={1}
        max={Math.max(pages, 1) * PAGE_SIZE}
        className="h-11 w-28 appearance-none bg-blackify-800 px-3 text-mc-1.5 text-white placeholder:text-mc-gray focus-ring-none focus-visible:focus-ring-inset [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="submit"
        className="h-11 shrink-0 bg-blackify-800 px-3 text-mc-1.5 text-white hover:bg-blackify-700 active:bg-blackify-700 focus-visible:focus-ring-inset"
      >
        {t("game.go")}
      </button>
    </form>
  );
}
