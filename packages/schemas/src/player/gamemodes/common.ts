/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ratio } from "@statsify/math";
import { s } from "#definition/s";

export const ExpSchema = s.number().leaderboard({ limit: 1_000_000 });
export const CoinsSchema = s.number().leaderboard({ limit: 100_000 });
export const AssistsSchema = s.number().leaderboard({ limit: 100_000 });

export const WinsStats = s.fields({
  wins() {
    return s
      .number()
      .color("green")
      .leaderboard({ limit: 500_000, additionalFields: [this.losses, this.wlr] });
  },
  losses() {
    return s
      .number()
      .color("red")
      .leaderboard({ limit: 100_000, additionalFields: [this.wins, this.wlr] });
  },
  wlr() {
    return s
      .number()
      .computed(ratio, [this.wins, this.losses])
      .color("gold")
      .leaderboard({ limit: 500_000, additionalFields: [this.wins, this.losses] });
  },
});

export const KillsStats = s.fields({
  kills() {
    return s
      .number()
      .color("green")
      .leaderboard({ limit: 500_000, additionalFields: [this.deaths, this.kdr] });
  },
  deaths() {
    return s
      .number()
      .color("red")
      .leaderboard({ limit: 100_000, additionalFields: [this.kills, this.kdr] });
  },
  kdr() {
    return s
      .number()
      .computed(ratio, [this.kills, this.deaths])
      .color("gold")
      .leaderboard({ limit: 500_000, additionalFields: [this.kills, this.deaths] });
  },
});

export const FinalKillsStats = s.fields({
  finalKills() {
    return s
      .number()
      .color("green")
      .leaderboard({ limit: 500_000, additionalFields: [this.finalDeaths, this.fkdr] });
  },
  finalDeaths() {
    return s
      .number()
      .color("red")
      .leaderboard({ limit: 100_000, additionalFields: [this.finalKills, this.fkdr] });
  },
  fkdr() {
    return s
      .number()
      .computed(ratio, [this.finalKills, this.finalDeaths])
      .color("gold")
      .leaderboard({ limit: 500_000, additionalFields: [this.finalKills, this.finalDeaths] });
  },
});

export const BedsStats = s.fields({
  bedsBroken() {
    return s
      .number()
      .color("green")
      .leaderboard({ limit: 500_000, additionalFields: [this.bedsLost, this.bblr] });
  },
  bedsLost() {
    return s
      .number()
      .color("red")
      .leaderboard({ limit: 100_000, additionalFields: [this.bedsBroken, this.bblr] });
  },
  bblr() {
    return s
      .number()
      .computed(ratio, [this.bedsBroken, this.bedsLost])
      .color("gold")
      .leaderboard({ limit: 500_000, additionalFields: [this.bedsBroken, this.bedsLost] });
  },
});
