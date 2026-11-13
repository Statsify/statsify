/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ArenaBrawlSchema, arenaBrawl } from "./gamemodes/arenabrawl/definition.js";
import { BedWarsSchema, bedWars } from "./gamemodes/bedwars/definition.js";
import { PaintballSchema, paintball } from "./gamemodes/paintball/definition.js";
import { ParkourSchema, parkour } from "./gamemodes/parkour/definition.js";
import { TurboKartRacersSchema, turboKartRacers } from "./gamemodes/turbokartracers/definition.js";
import { WallsSchema, walls } from "./gamemodes/walls/definition.js";
import type { APIData } from "@statsify/util";
import { s } from "#definition/s";

export const PlayerStatsSchema = s
  .object({
    arenabrawl: ArenaBrawlSchema,
    bedwars: BedWarsSchema,
    paintball: PaintballSchema,
    parkour: ParkourSchema,
    turbokartracers: TurboKartRacersSchema,
    walls: WallsSchema,
  })
  .leaderboard({ fieldName: "" });

export type PlayerStats = s.infer<typeof PlayerStatsSchema>;

export function playerStats(data: APIData = {}): s.input<typeof PlayerStatsSchema> {
  const stats = data.stats ?? {};
  const legacy = stats.Legacy ?? {};

  return {
    arenabrawl: arenaBrawl(stats.Arena, legacy),
    bedwars: bedWars(stats.Bedwars),
    paintball: paintball(stats.Paintball, legacy),
    parkour: parkour(data.parkourCompletions),
    turbokartracers: turboKartRacers(stats.GingerBread, legacy),
    walls: walls(stats.Walls, legacy),
  };
}
