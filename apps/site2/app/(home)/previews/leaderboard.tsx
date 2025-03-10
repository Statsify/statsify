/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import Image from "next/image";
import { Box } from "~/components/ui/box";
import { Fragment } from "react";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { cn } from "~/lib/util";
import { t } from "~/localize";
import type { PostLeaderboardResponse } from "@statsify/api-client";

export function LeaderboardPreview({ leaderboard, className }: {
  leaderboard: PostLeaderboardResponse;
  className?: string;
}) {
  const columns = leaderboard.fields.length + 3;

  // [TODO]: fix heads resizing on certain sizes

  return (
    <div
      className={cn("grid text-center gap-2 whitespace-nowrap", className)}
      style={{
        gridTemplateColumns: `repeat(minmax(min-content, max-content), ${columns})`,
      }}
    >
      <div style={{ gridColumn: `span ${columns} / ${columns}` }}>
        <Box>
          <MinecraftText className="font-bold text-mc-3 md:text-mc-4">{leaderboard.name}</MinecraftText>
        </Box>
      </div>
      <Box containerClass="hidden md:block" contentClass="font-bold">Pos</Box>
      <Box containerClass="col-span-3 md:col-span-2 font-bold">Player</Box>
      {leaderboard.fields.map((field) => <Box key={field} contentClass="font-bold">{field}</Box>)}
      {leaderboard.data.slice(0, 3).map((player) => (
        <Fragment key={player.id}>
          <Box containerClass="hidden md:block" contentClass="font-bold flex items-center justify-center">#{player.position}</Box>
          <Box containerClass="hidden md:block" contentClass="py-3 px-5"><Image height={32} width={32} alt={player.name} src={`https://api.statsify.net/skin/head?uuid=${player.id}&size=32&key=${process.env.API_KEY}`} /></Box>
          <Box containerClass="col-span-3 md:col-span-1" contentClass="text-start flex items-center"><MinecraftText>{player.name}</MinecraftText></Box>
          {player.fields.map((field, index) => <Box key={`${leaderboard.fields[index]}-${player.id}`} contentClass="flex justify-center items-center">{t(field)}</Box>)}
        </Fragment>
      ))}
    </div>
  );
}

