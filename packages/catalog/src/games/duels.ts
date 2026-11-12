/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DUELS_MODES, type DuelsModes } from "@statsify/schemas";
import { type Game, type StatEntry, selection } from "../catalog.js";

// The colors of the bot's Duels card (`duels.profile.tsx` and its tables), the same on every table.
const RECORD: Record<string, StatEntry> = {
  winstreak: { color: "§e" },
  bestWinstreak: { color: "§e" },
  wins: { color: "§a" },
  losses: { color: "§c" },
  wlr: { color: "§6" },
};

const KILLS: Record<string, StatEntry> = { kills: { color: "§a" }, deaths: { color: "§c" }, kdr: { color: "§6" } };
// The sidebar's Blocks Placed is Overall's; every mode but BedWars Overall stores its own.
const BASE: Record<string, StatEntry> = { ...RECORD, blocksPlaced: { color: "§9" } };
const PVP: Record<string, StatEntry> = { ...BASE, ...KILLS };
const SHOTS: Record<string, StatEntry> = { shotsFired: { color: "§6" } };
const KIT: Record<string, StatEntry> = { kit: selection("§e") };

export const DUELS: Game<DuelsModes> = {
  key: "duels",
  id: "DUELS",
  modes: DUELS_MODES,
  game: {
    tokens: { color: "§2" },
    pingRange: { color: "§a", suffix: "ms" },
  },
  shapes: [
    {
      modes: [
        "overall",
        "bow",
        "classic.overall",
        "classic.solo",
        "classic.doubles",
        "op.overall",
        "op.solo",
        "op.doubles",
        "skywars.overall",
        "skywars.solo",
        "skywars.doubles",
        "uhc.overall",
        "uhc.solo",
        "uhc.doubles",
        "uhc.fours",
        "uhc.deathmatch",
      ],
      stats: { ...PVP, ...SHOTS },
    },
    { modes: ["boxing", "combo", "megawalls", "nodebuff", "sumo", "bedwars.bedwars", "bedwars.rush"], stats: PVP },
    { modes: ["arena", "spleef.bowSpleef"], stats: { ...BASE, ...SHOTS } },
    { modes: ["blitzsg"], stats: { ...PVP, ...SHOTS, ...KIT } },
    { modes: ["quake"], stats: { ...PVP, headshots: { color: "§3" }, ...SHOTS } },
    {
      modes: ["bridge.overall", "bridge.solo", "bridge.doubles", "bridge.threes", "bridge.fours"],
      stats: { ...PVP, ...SHOTS, goals: { color: "§e" } },
    },
    {
      modes: ["bedwars.overall"],
      stats: {
        ...RECORD,
        ...KILLS,
        finalKills: { color: "§a" },
        finalDeaths: { color: "§c" },
        fkdr: { color: "§6" },
        bedsBroken: { color: "§a" },
        bedsLost: { color: "§c" },
        bblr: { color: "§6" },
        itemsPurchased: { color: "§d" },
      },
    },
    {
      modes: ["parkour"],
      stats: { ...BASE, bestTime: { color: "§d", unset: "N/A" }, checkpoints: { color: "§5" } },
    },
    { modes: ["spleef.spleef"], stats: { ...BASE, blocksBroken: { color: "§b" } } },
    // Wins over both Spleef modes, which its title counts.
    { modes: ["spleef"], stats: { overallWins: { color: "§a" } } },
    { modes: ["skywars"], stats: KIT },
    { modes: ["uhc"], stats: { gapplesEaten: { color: "§a" } } },
  ],
};
