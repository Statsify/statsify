/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { Box } from "~/components/ui/box";
import { MinecraftText } from "~/components/ui/minecraft-text";
import { Skin } from "~/components/ui/skin";
import { TableData } from "~/components/ui/table";
import { usePlayer } from "../context";

export default function BedWarsStats() {
  const player = usePlayer();
  const bedwars = player.stats.bedwars;
  const stats = bedwars.overall;

  return (
    <div className="grid grid-cols-3 w-fit gap-4">
      <div className="col-span-3 flex gap-4">
        <Skin uuid={player.uuid} className="h-full" />
        <div className="flex flex-col gap-4 grow text-center">
          <Box>
            <MinecraftText className="text-mc-4">{player.prefixName}</MinecraftText>
          </Box>
          <Box containerClass="text-mc-gray">
            <p>Level: <MinecraftText>{bedwars.levelFormatted}</MinecraftText></p>
            <p>EXP Progress: <span className="text-mc-aqua">{bedwars.progression.current}</span>/<span className="text-mc-green">{bedwars.progression.max}</span></p>
            <p>
              <MinecraftText>{bedwars.levelFormatted}</MinecraftText>
              {" "} <span className="text-mc-dark-gray">[</span><span className="text-mc-aqua">■■■■■■■</span>■■■<span className="text-mc-dark-gray">]</span> {" "}
              <MinecraftText>{bedwars.nextLevelFormatted}</MinecraftText>
            </p>
          </Box>
          <Box>
            <span className="font-bold"><span className="text-mc-red">Bed</span>Wars Stats</span> (Overall)
          </Box>
        </div>
        <Box contentClass="flex flex-col justify-center gap-2">
          <p><span className="text-mc-dark-green">●</span> Tokens: <span className="text-mc-dark-green">{bedwars.tokens}</span></p>
          <p><span className="text-mc-gray">●</span> Iron: <span className="text-mc-gray">{stats.itemsCollected.iron}</span></p>
          <p><span className="text-mc-gold">●</span> Gold: <span className="text-mc-gold">{stats.itemsCollected.gold}</span></p>
          <p><span className="text-mc-aqua">●</span> Diamonds: <span className="text-mc-aqua">{stats.itemsCollected.diamond}</span></p>
          <p><span className="text-mc-dark-green">●</span> Emeralds: <span className="text-mc-dark-green">{stats.itemsCollected.emerald}</span></p>
          <p><span className="text-mc-aqua">●</span> Slumber Tickets: <span className="text-mc-aqua">{bedwars.slumber.tickets}<span className="text-mc-gray">/{bedwars.slumber.wallet}</span></span></p>
          <p><span className="text-mc-pink">●</span> Total Slumber Tickets: <span className="text-mc-pink">{bedwars.slumber.totalTickets}</span></p>
          <p><span className="text-mc-green">●</span> Winstreak: <span className="text-mc-green">{stats.winstreak}</span></p>
        </Box>
      </div>
      <TableData title="Wins" value={stats.wins} color="text-mc-green" />
      <TableData title="Losses" value={stats.losses} color="text-mc-red" />
      <TableData title="WLR" value={stats.wlr} color="text-mc-gold" />
      <TableData title="Final Kills" value={stats.finalKills} color="text-mc-green" />
      <TableData title="Final Deaths" value={stats.finalDeaths} color="text-mc-red" />
      <TableData title="FKDR" value={stats.fkdr} color="text-mc-gold" />
      <TableData title="Kills" value={stats.kills} color="text-mc-green" />
      <TableData title="Deaths" value={stats.deaths} color="text-mc-red" />
      <TableData title="KDR" value={stats.kdr} color="text-mc-gold" />
      <TableData title="Beds Broken" value={stats.bedsBroken} color="text-mc-green" />
      <TableData title="Beds Lost" value={stats.bedsLost} color="text-mc-red" />
      <TableData title="BBLR" value={stats.bblr} color="text-mc-gold" />
      <Box
        borderRadius={{ top: 0 }}
        containerClass="col-span-3 text-mc-blue"
        contentClass="flex justify-center"
      >
        <span className="text-[#D0EEFC]">s</span><span className="text-[#AFD8F2]">t</span><span className="text-[#8EC3E7]">a</span><span className="text-[#6DADDD]">t</span><span className="text-[#4C97D2]">s</span><span className="text-[#418DCC]">i</span><span className="text-[#3784C5]">f</span><span className="text-[#2C7ABF]">y</span><span className="text-[#2776BC]">.</span><span className="text-[#2171B8]">n</span><span className="text-[#1C6DB5]">e</span><span className="text-[#1668B1]">t</span>
      </Box>
    </div>
  );
}

