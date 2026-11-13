/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ratio } from "@statsify/math";
import { s } from "#definition/s";

export const WinsStats = s.fields({
  wins: s.number().color("green"),
  losses: s.number().color("red"),
  wlr() {
    return s.computed(ratio, [this.wins, this.losses]).color("gold");
  },
});

export const KillsStats = s.fields({
  kills: s.number().color("green"),
  deaths: s.number().color("red"),
  kdr() {
    return s.computed(ratio, [this.kills, this.deaths]).color("gold");
  },
});

export const FinalKillsStats = s.fields({
  finalKills: s.number().color("green"),
  finalDeaths: s.number().color("red"),
  fkdr() {
    return s.computed(ratio, [this.finalKills, this.finalDeaths]).color("gold");
  },
});
