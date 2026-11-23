/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { Fragment, useEffect, useRef, useSyncExternalStore } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Search } from "~/components/search";
import { SkinHead } from "~/components/ui/skin";
import { cn } from "~/lib/util";
import { formatPosition } from "@statsify/profiles/format-position";
import { useNumberFormat } from "~/i18n/use-number-format";
import { useTranslation } from "react-i18next";
import type { AroundMiss } from "./leaderboard-data";
import type { CSSProperties } from "react";
import type { LeaderboardPage } from "@statsify/contract";

// One 48 px row per player at every width, with the column labels once in a Minecraft 16 §7 header.
// A row's position, head and name share one element across their three columns, and its values another. Below `md`
// rows pass under the frozen cells, so both sides of a row sit on the same solid blackify-800 rather than the
// translucent panel, and the frozen side ends in a 2 px edge like the panel's title bar. A row's stripe or highlight
// is a layer over that base on both elements, under the edge too, so the edge carries the highlight.
const HEADER = "flex h-10 items-center border-b-2 border-black/30 bg-blackify-800 px-2 text-mc-1 text-mc-gray";
const PLAYER = "sticky start-0 col-span-3 grid grid-cols-subgrid border-black/30 max-md:border-e-2";
const VALUES = "col-span-(--columns) grid grid-cols-subgrid";
const BASE = "max-md:bg-blackify-800";
const CELL = "flex h-12 items-center px-2";
// Layers (gradients), so they sit over the base color below `md` and over the panel from `md` up.
const STRIPE = "bg-linear-to-r from-black/15 to-black/15";
// The bot's highlighted row is a white 0.35 panel (`leaderboard.profile.tsx`).
const HIGHLIGHT = "bg-linear-to-r from-white/35 to-white/35";

/**
 * Below a 33rem box the name column drops the head and the badges and shows the name alone in its rank color. At
 * 33rem the widest position (`#1,234,567`), the head, a 16-character name after a four-digit level and `[MVP++]`,
 * and one value column all fit (measured in the Minecraft font at 24 px: 109, 40, 292 and 85 px, and the edge), and
 * the name column takes that name's full width, 18.25rem.
 */
const NARROW_ONLY = "@min-[33rem]:hidden";
const WIDE_ONLY = "@max-[33rem]:hidden";
const FULL_NAME_COLUMN = "@min-[33rem]:[--name:18.25rem]";

/** A row's name without its badges (level, rank), in the last color the badges set: the rank's. */
function bareName(name: string): string {
  const at = name.lastIndexOf(" ");
  if (at === -1) return name;
  const color = [...name.slice(0, at).matchAll(/§(?:#[\dA-Fa-f]{6}|[\da-fA-F])/g)].at(-1)?.[0] ?? "";
  return `${color}${name.slice(at + 1)}`;
}

const PHONE = "(width < 48rem)";

const subscribePhone = (onChange: () => void) => {
  const query = matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * A ref for the highlighted (`around`) row, which is brought into view, centered, when the page lands. After a client
 * navigation the router scrolls the window to the top once the new page is on screen, so the row is centered again
 * then; a page Back or Forward put back where it was left stays there.
 */
export function useHighlightScroll<T extends HTMLElement>(page: LeaderboardPage) {
  const ref = useRef<T>(null);
  const router = useRouter();

  useEffect(() => {
    const row = ref.current;
    if (!row) return;

    const scroll = () => row.scrollIntoView({ block: "center", inline: "nearest" });
    scroll();
    const unsubscribe = router.subscribe("onRendered", () => {
      unsubscribe();
      if (scrollY === 0) scroll();
    });
    return unsubscribe;
  }, [page, router]);

  return ref;
}

/**
 * The 25 rows of one page: position, head, name and the leaderboard's value columns. Each position cell carries the
 * row's UUID as its id, so `#<uuid>` links land on the row.
 *
 * Below `md` the table is a box bounded to the screen that scrolls both ways, with the header row frozen at its top and
 * the player columns at its left; scrolling hands back to the page at either end. From `md` up everything fits, so
 * nothing scrolls sideways and the header row sticks to the top of the page. Nothing above the table may set
 * `overflow`, or the header stops sticking.
 */
export function LeaderboardTable({ page }: { page: LeaderboardPage }) {
  const { t } = useTranslation();
  const n = useNumberFormat();
  // The server renders the phone layout's tab stop; from `md` up there is nothing to scroll.
  const phone = useSyncExternalStore(subscribePhone, () => matchMedia(PHONE).matches, () => true);

  const highlightRef = useHighlightScroll<HTMLDivElement>(page);

  if (page.rows.length === 0) {
    return <p className="text-mc-1.5 text-mc-gray text-center">{t("leaderboards.empty")}</p>;
  }

  const format = (value: string | number) => (typeof value === "number" ? n(value) : value);

  // Below `md` the frozen part stays about 230 px wide in the 307 px box of a 375 px phone, so a value column fits beside
  // it: the name gets up to 11.5rem (9rem and the hidden head's 2.5rem), less the room a long position takes (about
  // 0.6rem a character) and whatever a narrower box lacks. `contain-inline-size` keeps a long name from claiming more
  // than that. From a 33rem box up the head and badges are back and the name gets their whole width.
  const positionLength = `#${n(page.rows[page.rows.length - 1].position)}`.length;
  const cap = Math.min(90, Math.max(40, 108 - 6 * positionLength)) / 10 + 2.5;
  const shortName = `clamp(4rem, ${cap}rem + 100cqw - 307px, ${cap}rem)`;

  return (
    <Box>
      <section
        aria-label={page.name}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region, so keyboards can scroll it
        tabIndex={phone ? 0 : undefined}
        className="@container max-h-svh overflow-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-white/60 md:max-h-none md:overflow-visible"
      >
        <div
          className={cn(
            "grid w-max min-w-full grid-cols-[max-content_max-content_minmax(var(--name),1fr)_repeat(var(--columns),max-content)] [--name:var(--short-name)] md:w-auto md:min-w-0 md:grid-cols-[max-content_max-content_minmax(0,1fr)_repeat(var(--columns),max-content)]",
            FULL_NAME_COLUMN
          )}
          style={{ "--columns": page.fields.length, "--short-name": shortName } as CSSProperties}
        >
          {/* The corner is frozen both ways, above the header row and the player columns. */}
          <div className={cn(PLAYER, "top-0 z-20 bg-blackify-800")}>
            <div className={cn(HEADER, "justify-end")}>{t("leaderboards.position")}</div>
            <div className={cn(HEADER, "col-span-2")}>{t("leaderboards.player")}</div>
          </div>
          {page.fields.map((field) => (
            <div key={field} className={cn(HEADER, "sticky top-0 z-10 justify-end")}>
              {field}
            </div>
          ))}
          {page.rows.map((row, index) => {
            const tone = row.highlight ? HIGHLIGHT : index % 2 === 1 ? STRIPE : "";

            return (
              <Fragment key={row.uuid}>
                <div className={cn(PLAYER, BASE, tone, "z-10")}>
                  {/* `scroll-mt-10` keeps a `#<uuid>` row clear of the frozen header. */}
                  <div
                    id={row.uuid}
                    ref={row.highlight ? highlightRef : undefined}
                    className={cn(CELL, "scroll-mt-10 justify-end")}
                  >
                    <MinecraftText className="text-mc-1.5 md:text-mc-2">{formatPosition(row.position, n)}</MinecraftText>
                  </div>
                  <div className={cn(CELL, "justify-center", WIDE_ONLY)}>
                    <SkinHead uuid={row.uuid} size={24} />
                  </div>
                  <div className={cn(CELL, "col-start-3 min-w-0 contain-inline-size")}>
                    {/* `MinecraftText` puts its class on every segment, so the truncation lives on the link. */}
                    <Link
                      to="/{-$locale}/player/$name"
                      params={{ name: row.username }}
                      className="flex min-h-11 min-w-0 items-center hover:underline"
                    >
                      <span className={cn("min-w-0 truncate", WIDE_ONLY)}>
                        <MinecraftText className="text-mc-1.5 md:text-mc-2">{row.name}</MinecraftText>
                      </span>
                      <span className={cn("min-w-0 truncate", NARROW_ONLY)}>
                        <MinecraftText className="text-mc-1.5">{bareName(row.name)}</MinecraftText>
                      </span>
                    </Link>
                  </div>
                </div>
                <div className={cn(VALUES, BASE, tone)}>
                  {row.values.map((value, column) => (
                    <div key={page.fields[column]} className={cn(CELL, "justify-end text-mc-1.5 md:text-mc-2")}>
                      {format(value)}
                    </div>
                  ))}
                </div>
              </Fragment>
            );
          })}
        </div>
      </section>
    </Box>
  );
}

/** Previous and next page links around the page count; the links drop `around`. */
export function PageNav({ field, page, pages }: { field: string; page: number; pages: number }) {
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
    <nav className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2" aria-label={t("leaderboards.title")}>
      {pageLink(page - 1, t("leaderboards.previous"), page <= 0)}
      <p className="order-first basis-full text-mc-1 whitespace-nowrap text-center sm:order-none sm:basis-auto sm:text-mc-1.5">{t("leaderboards.page", { page: n(page + 1), pages: n(Math.max(pages, 1)) })}</p>
      {pageLink(page + 1, t("leaderboards.next"), page + 1 >= pages)}
    </nav>
  );
}

/** The `around=<name>` entry: the shared search box, submitting into this leaderboard's query string. */
export function FindPlayer({ field, miss }: { field: string; miss?: AroundMiss }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex w-full max-w-200 flex-col gap-2 self-center">
      <Search
        compact
        className="w-full"
        placeholder={t("leaderboards.find")}
        onSelect={(name) => navigate({ to: "/{-$locale}/leaderboards/$field", params: { field }, search: { around: name } })}
      />
      {miss && <p className="text-mc-1 text-mc-yellow text-center">{t(`leaderboards.${miss.kind}`, { name: miss.name })}</p>}
    </div>
  );
}
