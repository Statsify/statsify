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
    <Error className="gap-8 flex-col-reverse md:flex-col px-8">
      <Search key={name} className="w-full" defaultValue={name} target="bingo" />
      <div className="flex flex-col items-center justify-center gap-4">
        <Box>
          <span className="text-mc-dark-red">[</span>
          <span className="text-mc-red">???</span>
          <span className="text-mc-dark-red">]</span> {name}
        </Box>
        <Skin uuid="76a56ac7fcf649fca0531cb5c77cd9ae" className="h-64" />
        <h1 className="text-mc-4 lg:text-mc-7 text-mc-red font-bold">{t("bingo.notFound.title")}</h1>
        <p className="text-20 lg:text-24 font-medium text-mc-gray text-center">
          {t("bingo.notFound.description", { name })}
        </p>
        {name && (
          <Button asChild className="w-64">
            <Link to="/{-$locale}/player/$name" params={{ name }} activeOptions={{ exact: true }}>
              {t("bingo.notFound.lookup", { name })}
            </Link>
          </Button>
        )}
      </div>
    </Error>
  );
}
