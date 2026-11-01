/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { GameGrid } from "~/features/player/player-page";
import { Link } from "@tanstack/react-router";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { PageBackground } from "~/components/ui/background";
import { SessionLine } from "./session-line";
import { SkinBust } from "~/components/ui/skin";
import { StatPanel } from "~/features/game/stat-panel";
import { useTranslation } from "react-i18next";
import type { SessionPage } from "@statsify/contract";

/** A player's session: their nametag over when it started, then a panel for each game they played in it. */
export function SessionView({ page }: { page: SessionPage }) {
  const { t } = useTranslation();

  return (
    <div className="relative grow">
      <PageBackground background="general" viewport mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <Box className="content:flex content:items-center content:gap-4">
          <SkinBust uuid={page.uuid} className="h-24 w-16 shrink-0 sm:h-40 sm:w-28" />
          <div className="flex min-w-0 grow flex-col gap-2">
            <h1 className="flex flex-col gap-2">
              <Link to="/{-$locale}/player/$name" params={{ name: page.username }} className="wrap-break-word text-mc-2 hover:underline">
                <MinecraftText>{page.displayName}</MinecraftText>
              </Link>
              <span className="sr-only"> · </span>
              <span className="text-mc-1.5 font-bold">{t("session.title")}</span>
            </h1>
            <SessionLine start={page.start} updatedAt={page.updatedAt} />
          </div>
        </Box>
        <StatPanel section={page.overview} username={page.username} headline />
        <GameGrid games={page.games} username={page.username} session />
      </div>
    </div>
  );
}
