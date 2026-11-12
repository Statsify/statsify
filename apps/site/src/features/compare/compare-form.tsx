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

/**
 * The game page's Compare panel: another player's name, then the two side by side in the game and mode shown. A form, so
 * it works before the page's scripts load (the `/compare` route sends it on); with them, it navigates in place.
 */
export function ComparePanel({ id, page }: { id: string; page: GamePage }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputId = useId();
  const { locale } = localeRoute.useRouteContext();
  const search = pageSearch(page);
  useRevealOnOpen(id);

  return (
    <Box id={id} title={<h2 className="text-mc-1.5">{t("compare.title")}</h2>}>
      <form
        method="get"
        action={`${localePrefix(locale)}/compare`}
        onSubmit={(event) => {
          event.preventDefault();
          const b = String(new FormData(event.currentTarget).get("b")).trim();
          void navigate({ ...gameLink({ kind: "compare", a: page.username, b }, page.game.key), search });
        }}
        className="flex flex-wrap items-center gap-3"
      >
        <input type="hidden" name="a" value={page.username} />
        <input type="hidden" name="game" value={page.game.key} />
        {Object.entries(search).map(([key, value]) => value !== undefined && <input key={key} type="hidden" name={key} value={value} />)}
        <label htmlFor={inputId} className="shrink-0 text-mc-1 text-mc-gray">{t("compare.player")}</label>
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
