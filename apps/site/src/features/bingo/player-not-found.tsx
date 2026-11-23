/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { Error } from "~/components/ui/error";
import { Search } from "~/components/search";
import { Skin } from "~/components/ui/skin";
import { Link, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/** Bingo reads stored players only, so an unknown name is sent to its player page, which can look it up on Hypixel. */
export function PlayerNotFound() {
  const { t } = useTranslation();
  const { name = "" } = useParams({ strict: false });

  return (
    // The same layout as the player page's not-found, plus a Bingo search: the header has none on Bingo pages.
    <Error className="flex-col-reverse md:flex-col">
      <Search key={name} className="w-full max-w-200 self-center" defaultValue={name} target="bingo" />
      <div className="flex w-full max-w-160 flex-col items-center gap-4 self-center">
        <div className="flex max-w-full flex-col items-center gap-4">
          <Skin uuid="76a56ac7fcf649fca0531cb5c77cd9ae" className="h-40 sm:h-64" />
          <Box className="max-w-full content:truncate">
            <span className="text-mc-dark-red">[</span>
            <span className="text-mc-red">???</span>
            <span className="text-mc-dark-red">]</span> {name}
          </Box>
        </div>
        <h1 className="text-mc-3 lg:text-mc-4 text-mc-red font-bold">{t("bingo.notFound.title")}</h1>
        <p className="font-sans text-16 sm:text-20 font-medium text-mc-gray">{t("bingo.notFound.description", { name })}</p>
        {name && (
          <Button asChild variant="primary" className="w-full self-center sm:w-auto sm:min-w-64">
            <Link to="/{-$locale}/player/$name" params={{ name }} activeOptions={{ exact: true }}>
              {t("bingo.notFound.lookup", { name })}
            </Link>
          </Button>
        )}
      </div>
    </Error>
  );
}
