/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, getPrefixRequirement, romanNumeral } from "@statsify/util";
import { Field } from "../../../metadata";
import { Progression } from "../../../progression";
import { deepAdd, ratio } from "@statsify/math";
import { getTitle, titleScores } from "./util";

const prefixes = titleScores().flatMap((title) => {
  const calculatedTitles: { color: string; score: number }[] = [];

  for (let i = 0; i < (title.max ?? 5); i++) {
    calculatedTitles.push({ color: title.color.code, score: title.req + i * title.inc });
  }

  return calculatedTitles;
});

const overallPrefixes = titleScores(true).flatMap((title) => {
  const calculatedTitles: { color: string; score: number }[] = [];

  for (let i = 0; i < (title.max ?? 5); i++) {
    calculatedTitles.push({ color: title.color.code, score: title.req + i * title.inc });
  }

  return calculatedTitles;
});

export class BaseDuelsGameMode {
  @Field({ leaderboard: { enabled: false } })
  public bestWinstreak: number;

  @Field({ leaderboard: { enabled: false } })
  public winstreak: number;

  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: { enabled: false } })
  public blocksPlaced: number;

  public constructor(data: APIData, mode: string) {
    const prefix = mode ? `${mode}_` : mode;

    this.wins = data[`${prefix}wins`];
    this.losses = data[`${prefix}losses`];
    this.kills = data[`${prefix}kills`];
    this.deaths = data[`${prefix}deaths`];
    this.blocksPlaced = data[`${prefix}blocks_placed`];

    if (mode == "") {
      this.winstreak = data.current_winstreak;
      this.bestWinstreak = data.best_overall_winstreak;
    } else {
      this.winstreak = data[`current_winstreak_mode_${mode}`];
      this.bestWinstreak = data[`best_winstreak_mode_${mode}`];
    }

    BaseDuelsGameMode.applyRatios(this);
  }

  public static applyRatios(data: BaseDuelsGameMode) {
    data.wlr = ratio(data.wins, data.losses);
    data.kdr = ratio(data.kills, data.deaths);
  }
}

export class BridgeDuelsMode extends BaseDuelsGameMode {
  @Field()
  public goals: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.kills = data[`${mode}_bridge_kills`];
    this.deaths = data[`${mode}_bridge_deaths`];
    this.goals = data[`${mode}_goals`] || data[`${mode}_captures`];

    BaseDuelsGameMode.applyRatios(this);
  }
}

export class BridgeDuels {
  @Field()
  public title: string;

  @Field()
  public titleFormatted: string;

  @Field()
  public overall: BridgeDuelsMode;

  @Field()
  public solo: BridgeDuelsMode;

  @Field()
  public doubles: BridgeDuelsMode;

  @Field()
  public threes: BridgeDuelsMode;

  @Field()
  public fours: BridgeDuelsMode;

  @Field()
  public "2v2v2v2": BridgeDuelsMode;

  @Field()
  public "3v3v3v3": BridgeDuelsMode;

  @Field()
  public ctf: BridgeDuelsMode;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;

  public constructor(data: APIData) {
    this.solo = new BridgeDuelsMode(data, "bridge_duel");
    this.doubles = new BridgeDuelsMode(data, "bridge_doubles");
    this.threes = new BridgeDuelsMode(data, "bridge_threes");
    this.fours = new BridgeDuelsMode(data, "bridge_four");
    this["2v2v2v2"] = new BridgeDuelsMode(data, "bridge_2v2v2v2");
    this["3v3v3v3"] = new BridgeDuelsMode(data, "bridge_3v3v3v3");
    this.ctf = new BridgeDuelsMode(data, "capture_threes");

    this.overall = deepAdd(
      this.solo,
      this.doubles,
      this.threes,
      this.fours,
      this["2v2v2v2"],
      this["3v3v3v3"],
      this.ctf
    );

    this.overall.winstreak = data.current_bridge_winstreak;
    this.overall.bestWinstreak = data.best_bridge_winstreak;

    BaseDuelsGameMode.applyRatios(this.overall);

    const { formatted, raw, bold, semi, max, index, color, req, inc } = getTitle(
      this.overall.wins,
      "Bridge"
    );

    this.title = raw;
    this.titleFormatted = formatted;

    this.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
      index
    )}]`;

    const nextData = getTitle(req + index * inc, "Bridge");

    this.nextTitleLevelFormatted = `${nextData.color.code}${
      nextData.bold || nextData.semi ? "§l" : ""
    }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

    this.progression = new Progression(
      Math.abs(getPrefixRequirement(prefixes, this.overall.wins) - this.overall.wins),
      getPrefixRequirement(prefixes, this.overall.wins, 1) -
        getPrefixRequirement(prefixes, this.overall.wins)
    );
  }
}
export class MultiDuelsGameMode {
  @Field({ store: { store: false } })
  public titlePrefix: string;

  @Field()
  public title: string;

  @Field()
  public titleFormatted: string;

  @Field()
  public overall: BaseDuelsGameMode;

  @Field()
  public solo: BaseDuelsGameMode;

  @Field()
  public doubles: BaseDuelsGameMode;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;

  public constructor(data: APIData, title: string, short: string, long: string) {
    this.solo = new BaseDuelsGameMode(data, `${short}_duel`);
    this.doubles = new BaseDuelsGameMode(data, `${short}_doubles`);

    this.overall = deepAdd(this.solo, this.doubles);
    BaseDuelsGameMode.applyRatios(this.overall);
    this.overall.bestWinstreak = data[`best_${long}_winstreak`];
    this.overall.winstreak = data[`current_${long}_winstreak`];

    this.titlePrefix = title;

    const { formatted, raw, bold, semi, max, index, color, req, inc } = getTitle(
      this.overall.wins,
      this.titlePrefix
    );

    this.title = raw;
    this.titleFormatted = formatted;

    this.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
      index
    )}]`;

    const nextData = getTitle(req + index * inc, this.titlePrefix);

    this.nextTitleLevelFormatted = `${nextData.color.code}${
      nextData.bold || nextData.semi ? "§l" : ""
    }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

    this.progression = new Progression(
      Math.abs(getPrefixRequirement(prefixes, this.overall.wins) - this.overall.wins),
      getPrefixRequirement(prefixes, this.overall.wins, 1) -
        getPrefixRequirement(prefixes, this.overall.wins)
    );
  }
}

export class SingleDuelsGameMode extends BaseDuelsGameMode {
  @Field({ store: { store: false } })
  public titlePrefix: string;

  @Field({ store: { default: "None" } })
  public title: string;

  @Field({ store: { default: "§7None§r" } })
  public titleFormatted: string;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;

  public constructor(data: APIData, title: string, mode: string) {
    super(data, mode);
    this.titlePrefix = title;

    const { formatted, raw, bold, semi, max, index, color, req, inc } = getTitle(
      this.wins,
      this.titlePrefix
    );

    this.title = raw;
    this.titleFormatted = formatted;

    this.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
      index
    )}]`;

    const nextData = getTitle(req + index * inc, this.titlePrefix);

    this.nextTitleLevelFormatted = `${nextData.color.code}${
      nextData.bold || nextData.semi ? "§l" : ""
    }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

    this.progression = new Progression(
      Math.abs(
        getPrefixRequirement(
          this.titlePrefix === "" ? overallPrefixes : prefixes,
          this.wins
        ) - this.wins
      ),
      getPrefixRequirement(
        this.titlePrefix === "" ? overallPrefixes : prefixes,
        this.wins,
        1
      ) -
        getPrefixRequirement(
          this.titlePrefix === "" ? overallPrefixes : prefixes,
          this.wins
        )
    );
  }
}

export class UHCDuels {
  @Field()
  public title: string;

  @Field()
  public titleFormatted: string;

  @Field()
  public overall: BaseDuelsGameMode;

  @Field()
  public solo: BaseDuelsGameMode;

  @Field()
  public doubles: BaseDuelsGameMode;

  @Field()
  public fours: BaseDuelsGameMode;

  @Field()
  public deathmatch: BaseDuelsGameMode;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;
  public constructor(data: APIData) {
    this.solo = new BaseDuelsGameMode(data, "uhc_duel");
    this.doubles = new BaseDuelsGameMode(data, "uhc_doubles");
    this.fours = new BaseDuelsGameMode(data, "uhc_four");
    this.deathmatch = new BaseDuelsGameMode(data, "uhc_meetup");

    this.overall = deepAdd(this.solo, this.doubles, this.fours, this.deathmatch);

    this.overall.winstreak = data.current_uhc_winstreak;
    this.overall.bestWinstreak = data.best_uhc_winstreak;

    BaseDuelsGameMode.applyRatios(this.overall);

    const { formatted, raw, bold, semi, max, index, color, req, inc } = getTitle(
      this.overall.wins,
      "UHC"
    );

    this.title = raw;
    this.titleFormatted = formatted;

    this.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
      index
    )}]`;

    const nextData = getTitle(req + index * inc, "UHC");

    this.nextTitleLevelFormatted = `${nextData.color.code}${
      nextData.bold || nextData.semi ? "§l" : ""
    }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

    this.progression = new Progression(
      Math.abs(getPrefixRequirement(prefixes, this.overall.wins) - this.overall.wins),
      getPrefixRequirement(prefixes, this.overall.wins, 1) -
        getPrefixRequirement(prefixes, this.overall.wins)
    );
  }
}
