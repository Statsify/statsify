/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { s } from "#definition/s";

export const WinsStats = {
  wins: s.number().color("green"),
  losses: s.number().color("red"),
  wlr() {
    return s.ratio(this.wins, this.losses).color("gold");
  },
};

export const KillsStats = {
  kills: s.number().color("green"),
  deaths: s.number().color("red"),
  kdr() {
    return s.ratio(this.kills, this.deaths).color("gold");
  },
};

export const FinalKillsStats = {
  finalKills: s.number().color("green"),
  finalDeaths: s.number().color("red"),
  fkdr() {
    return s.ratio(this.finalKills, this.finalDeaths).color("gold");
  },
};
