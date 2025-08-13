/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, romanNumeral } from "@statsify/util";
import { Field } from "#metadata";
import { GamePrefix, createPrefixProgression } from "#prefixes";
import { Progression } from "#progression";
import { type Title, getTitle, titleScores } from "./util.js";
import { add, deepAdd, ratio } from "@statsify/math";

const getPrefixes = (titles: Title[]) =>
  titles.flatMap((title) => {
    const calculatedTitles: GamePrefix[] = [];

    for (let i = 0; i < (title.max ?? 5); i++) {
      calculatedTitles.push({
        fmt: (n) => `${title.color.code}[${n}]`,
        req: title.req + i * title.inc,
      });
    }

    return calculatedTitles;
  });

const prefixes = getPrefixes(titleScores());
const overallPrefixes = getPrefixes(titleScores(true));

export class BaseDuelsGameMode {
  @Field()
  public bestWinstreak: number;

  @Field({ leaderboard: { enabled: false } })
  public winstreak: number;

  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field({ leaderboard: { enabled: false } })
  public blocksPlaced: number;

  public constructor(data: APIData, mode: string) {
    const prefix = mode ? `${mode}_` : mode;

    this.wins = data[`${prefix}wins`];
    this.losses = data[`${prefix}losses`];

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
  }
}

export class PVPBaseDuelsGameMode extends BaseDuelsGameMode {
  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);
    const prefix = mode ? `${mode}_` : mode;

    this.kills = data[`${prefix}kills`];
    this.deaths = data[`${prefix}deaths`];
    this.blocksPlaced = data[`${prefix}blocks_placed`];

    PVPBaseDuelsGameMode.applyRatios(this);
  }

  public static applyRatios(data: PVPBaseDuelsGameMode) {
    BaseDuelsGameMode.applyRatios(data);
    data.kdr = ratio(data.kills, data.deaths);
  }
}

export class BowPVPBaseDuelsGameMode extends PVPBaseDuelsGameMode {
  @Field()
  public shotsFired: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);
    this.shotsFired = data[`${mode}_bow_shots`];
  }
}

export class BowBaseDuelsGameMode extends PVPBaseDuelsGameMode {
  @Field()
  public shotsFired: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);
    this.shotsFired = data[`${mode}_bow_shots`];
  }
}

export class BridgeDuelsMode extends BowPVPBaseDuelsGameMode {
  @Field()
  public goals: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.kills = data[`${mode}_bridge_kills`];
    this.deaths = data[`${mode}_bridge_deaths`];
    this.goals = data[`${mode}_goals`] || data[`${mode}_captures`];

    PVPBaseDuelsGameMode.applyRatios(this);
  }
}

export class BridgeDuels {
  @Field()
  public titleFormatted: string;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;

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


  public constructor(data: APIData) {
    this.solo = new BridgeDuelsMode(data, "bridge_duel");
    this.doubles = new BridgeDuelsMode(data, "bridge_doubles");
    this.threes = new BridgeDuelsMode(data, "bridge_threes");
    this.fours = new BridgeDuelsMode(data, "bridge_four");

    this.overall = deepAdd(
      this.solo,
      this.doubles,
      this.threes,
      this.fours,
    );

    this.overall.winstreak = data.current_bridge_winstreak;
    this.overall.bestWinstreak = data.best_bridge_winstreak;

    PVPBaseDuelsGameMode.applyRatios(this.overall);

    const { formatted, bold, semi, max, index, color, req, inc } = getTitle(
      this.overall.wins,
      "Bridge"
    );

    this.titleFormatted = formatted;

    this.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
      index
    )}]`;

    const nextData = getTitle(req + index * inc, "Bridge");

    this.nextTitleLevelFormatted = `${nextData.color.code}${
      nextData.bold || nextData.semi ? "§l" : ""
    }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

    this.progression = createPrefixProgression(prefixes, this.overall.wins);
  }
}

export class MultiPVPDuelsGameMode {
  @Field()
  public titleFormatted: string;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field()
  public overall: BowPVPBaseDuelsGameMode;

  @Field()
  public solo: BowPVPBaseDuelsGameMode;

  @Field()
  public doubles: BowPVPBaseDuelsGameMode;

  public constructor(data: APIData, title: string, short: string, long: string) {
    this.solo = new BowPVPBaseDuelsGameMode(data, `${short}_duel`);
    this.doubles = new BowPVPBaseDuelsGameMode(data, `${short}_doubles`);

    this.overall = deepAdd(this.solo, this.doubles);
    BowPVPBaseDuelsGameMode.applyRatios(this.overall);

    this.overall.bestWinstreak = data[`best_${long}_winstreak`];
    this.overall.winstreak = data[`current_${long}_winstreak`];

    const { formatted, bold, semi, max, index, color, req, inc } = getTitle(
      this.overall.wins,
      title
    );

    this.titleFormatted = formatted;

    this.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
      index
    )}]`;

    const nextData = getTitle(req + index * inc, title);

    this.nextTitleLevelFormatted = `${nextData.color.code}${
      nextData.bold || nextData.semi ? "§l" : ""
    }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

    this.progression = createPrefixProgression(prefixes, this.overall.wins);
  }
}

const assignTitles = (
  data: SinglePVPDuelsGameMode | SingleDuelsGameMode,
  title: string
) => {
  const { formatted, bold, semi, max, index, color, req, inc } = getTitle(
    data.wins,
    title
  );

  data.titleFormatted = formatted;

  data.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
    index
  )}]`;

  const nextData = getTitle(req + index * inc, title);

  data.nextTitleLevelFormatted = `${nextData.color.code}${
    nextData.bold || nextData.semi ? "§l" : ""
  }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

  const titlePrefixes = title === "" ? overallPrefixes : prefixes;
  data.progression = createPrefixProgression(titlePrefixes, data.wins);
};

export class SinglePVPDuelsGameMode extends PVPBaseDuelsGameMode {
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
    assignTitles(this, title);
  }
}

export class SingleBowPVPDuelsGameMode extends SinglePVPDuelsGameMode {
  @Field()
  public shotsFired: number;

  public constructor(data: APIData, title: string, mode: string) {
    super(data, title, mode);
    mode = mode ? `${mode}_` : mode;
    this.shotsFired = data[`${mode}bow_shots`];
  }
}

export class SingleDuelsGameMode extends BaseDuelsGameMode {
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
    assignTitles(this, title);
  }
}

export class ArenaDuels extends SingleDuelsGameMode {
  @Field()
  public shotsFired: number;

  public constructor(data: APIData, title: string, mode: string) {
    super(data, title, mode);
    this.shotsFired = data[`${mode}_bow_shots`];
  }
}

export class UHCDuels {
  @Field()
  public titleFormatted: string;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field()
  public overall: BowPVPBaseDuelsGameMode;

  @Field()
  public solo: BowPVPBaseDuelsGameMode;

  @Field()
  public doubles: BowPVPBaseDuelsGameMode;

  @Field()
  public fours: BowPVPBaseDuelsGameMode;

  @Field()
  public deathmatch: BowPVPBaseDuelsGameMode;

  public constructor(data: APIData) {
    this.solo = new BowPVPBaseDuelsGameMode(data, "uhc_duel");
    this.doubles = new BowPVPBaseDuelsGameMode(data, "uhc_doubles");
    this.fours = new BowPVPBaseDuelsGameMode(data, "uhc_four");
    this.deathmatch = new BowPVPBaseDuelsGameMode(data, "uhc_meetup");

    this.overall = deepAdd(this.solo, this.doubles, this.fours, this.deathmatch);

    this.overall.winstreak = data.current_uhc_winstreak;
    this.overall.bestWinstreak = data.best_uhc_winstreak;

    BowPVPBaseDuelsGameMode.applyRatios(this.overall);

    const { formatted, bold, semi, max, index, color, req, inc } = getTitle(
      this.overall.wins,
      "UHC"
    );

    this.titleFormatted = formatted;

    this.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
      index
    )}]`;

    const nextData = getTitle(req + index * inc, "UHC");

    this.nextTitleLevelFormatted = `${nextData.color.code}${
      nextData.bold || nextData.semi ? "§l" : ""
    }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

    this.progression = createPrefixProgression(prefixes, this.overall.wins);
  }
}

export class SkyWarsDuels extends MultiPVPDuelsGameMode {
  @Field({ store: { default: "none" } })
  public kit: string;

  public constructor(data: APIData) {
    super(data, "SkyWars", "sw", "skywars");

    const kit = data.sw_duels_kit_new3 ?? data.sw_duels_kit_new2 ?? data.sw_duels_kit_new ?? "none";
    this.kit = kit.replace("kit_", "").replaceAll("ranked_", "").replaceAll("mega_", "").replaceAll("defending_team_", "");
  }
}

export class BlitzSGDuels extends SingleBowPVPDuelsGameMode {
  @Field({ store: { default: "none" } })
  public kit: string;

  public constructor(data: APIData) {
    super(data, "Blitz", "blitz_duel");
    this.kit = data.blitz_duels_kit ?? "none";
  }
}

export class QuakeDuels extends SinglePVPDuelsGameMode {
  @Field()
  public headshots: number;

  @Field()
  public shotsFired: number;

  public constructor(data: APIData) {
    super(data, "Quakecraft", "quake_duel");
    this.headshots = data.quake_duel_quake_headshots;
    this.shotsFired = data.quake_duel_quake_shots_taken;
  }
}

export class BedWarsDuelsOverallMode {
  @Field()
  public bestWinstreak: number;

  @Field()
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

  @Field()
  public finalKills: number;

  @Field()
  public finalDeaths: number;

  @Field()
  public fkdr: number;

  @Field()
  public bedsBroken: number;

  @Field()
  public bedsLost: number;

  @Field()
  public bblr: number;

  @Field()
  public itemsPurchased: number;

  public constructor(data: APIData) {
    this.bestWinstreak = data.best_bedwars_winstreak;
    this.winstreak = data.current_bedwars_winstreak;

    this.wins = data.wins_bedwars;
    this.losses = data.losses_bedwars;
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data.kills_bedwars;
    this.deaths = data.deaths_bedwars;
    this.kdr = ratio(this.kills, this.deaths);

    this.finalKills = data.final_kills_bedwars;
    this.finalDeaths = data.final_deaths_bedwars;
    this.fkdr = ratio(this.finalKills, this.finalDeaths);

    this.bedsBroken = data.beds_broken_bedwars;
    this.bedsLost = data.beds_lost_bedwars;
    this.bblr = ratio(this.bedsBroken, this.bedsLost);

    this.itemsPurchased = data.items_purchased_bedwars;
  }
}

export class BedwarsDuels {
  @Field()
  public titleFormatted: string;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field({ leaderboard: { name: "BedWars Overall" } })
  public overall: BedWarsDuelsOverallMode;

  @Field({ leaderboard: { name: "BedWars Duel" } })
  public bedwars: PVPBaseDuelsGameMode;

  @Field({ leaderboard: { name: "Bed Rush" } })
  public rush: PVPBaseDuelsGameMode;

  public constructor(data: APIData) {
    this.bedwars = new PVPBaseDuelsGameMode(data, "bedwars_two_one_duels");
    this.rush = new PVPBaseDuelsGameMode(data, "bedwars_two_one_duels_rush");
    this.overall = new BedWarsDuelsOverallMode(data);

    const { formatted, bold, semi, max, index, color, req, inc } = getTitle(
      this.overall.wins,
      "BedWars"
    );

    this.titleFormatted = formatted;

    this.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
      index
    )}]`;

    const nextData = getTitle(req + index * inc, "BedWars");

    this.nextTitleLevelFormatted = `${nextData.color.code}${
      nextData.bold || nextData.semi ? "§l" : ""
    }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

    this.progression = createPrefixProgression(prefixes, this.overall.wins);
  }
}

export class SpleefDuelMode extends BaseDuelsGameMode {
  @Field()
  public blocksBroken: number;

  public constructor(data: APIData) {
    super(data, "spleef_duel");
    this.blocksBroken = data.spleef_duel_blocks_broken;
  }
}

export class BowSpleefDuelMode extends BaseDuelsGameMode {
  @Field()
  public shotsFired: number;

  public constructor(data: APIData) {
    super(data, "bowspleef_duel");
    this.shotsFired = data.bowspleef_duel_bow_shots;
  }
}

export class SpleefDuels {
  @Field()
  public titleFormatted: string;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field({ leaderboard: {name:"Spleef Overall Wins",fieldName:"Wins"}})
  public overallWins: number;

  @Field({ leaderboard: {fieldName:"Spleef"}})
  public spleef: SpleefDuelMode;

  @Field()
  public bowSpleef: BowSpleefDuelMode;

  public constructor(data: APIData) {
    this.spleef = new SpleefDuelMode(data);
    this.bowSpleef = new BowSpleefDuelMode(data);
    this.overallWins=add(this.spleef.wins,this.bowSpleef.wins);

    const { formatted, bold, semi, max, index, color, req, inc } = getTitle(
      this.overallWins,
      "Spleef"
    );

    this.titleFormatted = formatted;

    this.titleLevelFormatted = `${color.code}${bold || semi ? "§l" : ""}[${romanNumeral(
      index
    )}]`;

    const nextData = getTitle(req + index * inc, "Spleef");

    this.nextTitleLevelFormatted = `${nextData.color.code}${
      nextData.bold || nextData.semi ? "§l" : ""
    }[${romanNumeral(index + 1 > (max ?? 5) ? 1 : index + 1)}]`;

    this.progression = createPrefixProgression(prefixes, this.overallWins);
  }
}

// [INFO]: Hypixel doesn't seem to store MegaWalls Duels kits in the API
