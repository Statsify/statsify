/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { gameLink, pageSearch } from "~/features/game/game-data";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { localePrefix } from "~/i18n/locales";
import { useId } from "react";
import { useRevealOnOpen } from "~/features/player/share-panel";
import { useTranslation } from "react-i18next";
import type { GamePage } from "@statsify/contract";

const localeRoute = getRouteApi("/{-$locale}");

/** The game page's Compare panel: another player's name, then the two side by side in the game and mode shown. */
export function ComparePanel({ id, page }: { id: string; page: GamePage }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = pageSearch(page);

  return (
    <CompareForm
      id={id}
      title={t("compare.title")}
      label={t("compare.player")}
      action="/compare"
      fields={{ a: page.username, game: page.game.key, ...search }}
      open={(b) => navigate({ ...gameLink({ kind: "compare", a: page.username, b }, page.game.key), search })}
    />
  );
}

/** The guild page's Compare panel: another guild's name, then the two side by side. */
export function GuildComparePanel({ id, name }: { id: string; name: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <CompareForm
      id={id}
      title={t("compare.guildTitle")}
      label={t("compare.guild")}
      action={`/guild/${encodeURIComponent(name)}/compare`}
      open={(b) => navigate({ to: "/{-$locale}/guild/$name/compare/$b", params: { name, b } })}
    />
  );
}

/**
 * The other name's box. A form, so it works before the page's scripts load (`action`, under the locale, sends it on
 * with `fields` and the name as `b`); with them, `open` navigates in place.
 */
function CompareForm({
  id,
  title,
  label,
  action,
  fields,
  open,
}: {
  id: string;
  title: string;
  label: string;
  action: string;
  fields?: Record<string, string | undefined>;
  open: (b: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const { locale } = localeRoute.useRouteContext();
  useRevealOnOpen(id);

  return (
    <Box id={id} title={<h2 className="text-mc-1.5">{title}</h2>}>
      <form
        method="get"
        action={`${localePrefix(locale)}${action}`}
        onSubmit={(event) => {
          event.preventDefault();
          void open(String(new FormData(event.currentTarget).get("b")).trim());
        }}
        className="flex flex-wrap items-center gap-3"
      >
        {Object.entries(fields ?? {}).map(([key, value]) => value !== undefined && <input key={key} type="hidden" name={key} value={value} />)}
        <label htmlFor={inputId} className="shrink-0 text-mc-1 text-mc-gray">{label}</label>
        <input
          id={inputId}
          name="b"
          required
          autoComplete="off"
          spellCheck={false}
          className="h-11 min-w-0 grow basis-40 bg-blackify-800 px-3 text-mc-1.5 text-white focus-visible:focus-ring-inset"
        />
        <button type="submit" className="h-11 shrink-0 bg-blackify-800 px-3 text-mc-1.5 text-white hover:bg-blackify-700 focus-visible:focus-ring-inset">
          {t("compare.submit")}
        </button>
      </form>
    </Box>
  );
}
