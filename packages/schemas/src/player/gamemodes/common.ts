/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ratio } from "@statsify/math";
import { s } from "#definition/s";

export const ExpSchema = s.number().leaderboard({ fieldName: "EXP", limit: 1_000_000 });
export const CoinsSchema = s.number().leaderboard({ limit: 100_000 });
export const AssistsSchema = s.number().leaderboard({ limit: 100_000 });

/** Wins or kills on their own, without the rest of their ratio beside them */
export const WinsSchema = s.number().leaderboard({ limit: 500_000 });
export const KillsSchema = s.number().leaderboard({ limit: 500_000 });

const winsStats = (limit: number, lossesLimit: number) =>
  s.fields({
    wins() {
      return s
        .number()
        .color("§a")
        .leaderboard({ limit, additionalFields: [this.losses, this.wlr] });
    },
    losses() {
      return s
        .number()
        .color("§c")
        .leaderboard({ limit: lossesLimit, additionalFields: [this.wins, this.wlr] });
    },
    wlr() {
      return s
        .number()
        .computed(ratio, [this.wins, this.losses])
        .color("§6")
        .leaderboard({ fieldName: "WLR", limit, additionalFields: [this.wins, this.losses] });
    },
  });

const killsStats = (limit: number, deathsLimit: number) =>
  s.fields({
    kills() {
      return s
        .number()
        .color("§a")
        .leaderboard({ limit, additionalFields: [this.deaths, this.kdr] });
    },
    deaths() {
      return s
        .number()
        .color("§c")
        .leaderboard({ limit: deathsLimit, additionalFields: [this.kills, this.kdr] });
    },
    kdr() {
      return s
        .number()
        .computed(ratio, [this.kills, this.deaths])
        .color("§6")
        .leaderboard({ fieldName: "KDR", limit, additionalFields: [this.kills, this.deaths] });
    },
  });

const finalKillsStats = (limit: number, finalDeathsLimit: number) =>
  s.fields({
    finalKills() {
      return s
        .number()
        .color("§a")
        .leaderboard({ limit, additionalFields: [this.finalDeaths, this.fkdr] });
    },
    finalDeaths() {
      return s
        .number()
        .color("§c")
        .leaderboard({ limit: finalDeathsLimit, additionalFields: [this.finalKills, this.fkdr] });
    },
    fkdr() {
      return s
        .number()
        .computed(ratio, [this.finalKills, this.finalDeaths])
        .color("§6")
        .leaderboard({ fieldName: "FKDR", limit, additionalFields: [this.finalKills, this.finalDeaths] });
    },
  });

export const WinsStats = winsStats(500_000, 100_000);
export const KillsStats = killsStats(500_000, 100_000);
export const FinalKillsStats = finalKillsStats(500_000, 100_000);

/** For stats per kit or class, ranked on smaller boards */
export const KitWinsStats = winsStats(10_000, 10_000);
export const KitKillsStats = killsStats(10_000, 10_000);
export const KitFinalKillsStats = finalKillsStats(10_000, 10_000);

export const BedsStats = s.fields({
  bedsBroken() {
    return s
      .number()
      .color("§a")
      .leaderboard({ limit: 500_000, additionalFields: [this.bedsLost, this.bblr] });
  },
  bedsLost() {
    return s
      .number()
      .color("§c")
      .leaderboard({ limit: 100_000, additionalFields: [this.bedsBroken, this.bblr] });
  },
  bblr() {
    return s
      .number()
      .computed(ratio, [this.bedsBroken, this.bedsLost])
      .color("§6")
      .leaderboard({ fieldName: "BBLR", limit: 500_000, additionalFields: [this.bedsBroken, this.bedsLost] });
  },
});
