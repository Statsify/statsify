/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import Link from "next/link";
import { Box } from "~/components/ui/box";
import { FormattedGame } from "@statsify/schemas/game/constants";
import { Fragment } from "react";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { usePlayer } from "./context";

export default function PlayerOverview() {
  const player = usePlayer();
  const stats = player.stats;

  return (
    <div>
      <GameCard
        name={FormattedGame.BEDWARS}
        stats={[
          ["Wins", stats.bedwars.overall.wins, "text-mc-green"],
          ["Losses", stats.bedwars.overall.losses, "text-mc-red"],
          ["WLR", stats.bedwars.overall.wlr, "text-mc-gold"],
        ]}
        href="bedwars"
      />
    </div>
  );
}

function GameCard({ name, stats, href }: { name: string; stats: [name: string, value: string, color: string][]; href: string }) {
  const player = usePlayer();

  return (
    <Box>
      <Link href={`/players/${player.uuid}/${href}`} className="flex flex-col gap-4">
        <MinecraftText className="text-mc-4">§l{name}</MinecraftText>
        <div className="grid grid-cols-2">
          {stats.map(([title, value, color]) => (
            <Fragment key={title}>
              <p className="text-start">{title}</p>
              <p className={`text-end ${color}`}>{value}</p>
            </Fragment>
          ))}
        </div>
      </Link>
    </Box>
  );
}
