/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime } from "@statsify/util";
import { Field } from "#metadata";
import { Progression } from "#progression";
import { TitleRequirement, getTitleAndProgression } from "./util.js";
import { add, deepAdd, ratio } from "@statsify/math";

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
      new BridgeDuelsMode(data, "bridge_2v2v2v2"),
      new BridgeDuelsMode(data, "bridge_3v3v3v3"),
      new BridgeDuelsMode(data, "capture_threes")
    );

    this.overall.winstreak = data.current_bridge_winstreak;
    this.overall.bestWinstreak = data.best_bridge_winstreak;

    PVPBaseDuelsGameMode.applyRatios(this.overall);

    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = getTitleAndProgression({
      score: this.overall.wins,
      mode: "Bridge",
      data,
      titleRequirement: "half",
    });

    this.titleFormatted = titleFormatted;
    this.titleLevelFormatted = titleLevelFormatted;
    this.nextTitleLevelFormatted = nextTitleLevelFormatted;
    this.progression = progression;
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

  public constructor(data: APIData, title: string, short: string, long: string, titleRequirement: TitleRequirement) {
    this.solo = new BowPVPBaseDuelsGameMode(data, `${short}_duel`);
    this.doubles = new BowPVPBaseDuelsGameMode(data, `${short}_doubles`);

    this.overall = deepAdd(this.solo, this.doubles);
    BowPVPBaseDuelsGameMode.applyRatios(this.overall);

    this.overall.bestWinstreak = data[`best_${long}_winstreak`];
    this.overall.winstreak = data[`current_${long}_winstreak`];

    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = getTitleAndProgression({
      score: this.overall.wins,
      mode: title,
      data,
      titleRequirement,
    });

    this.titleFormatted = titleFormatted;
    this.titleLevelFormatted = titleLevelFormatted;
    this.nextTitleLevelFormatted = nextTitleLevelFormatted;
    this.progression = progression;
  }
}

export class SinglePVPDuelsGameMode extends PVPBaseDuelsGameMode {
  @Field({ store: { default: "§7None§r" } })
  public titleFormatted: string;

  @Field()
  public titleLevelFormatted: string;

  @Field()
  public nextTitleLevelFormatted: string;

  @Field()
  public progression: Progression;

  public constructor(data: APIData, title: string, mode: string, titleRequirement: TitleRequirement) {
    super(data, mode);

    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = getTitleAndProgression({
      score: this.wins,
      mode: title,
      data,
      titleRequirement,
    });

    this.titleFormatted = titleFormatted;
    this.titleLevelFormatted = titleLevelFormatted;
    this.nextTitleLevelFormatted = nextTitleLevelFormatted;
    this.progression = progression;
  }
}

export class SingleBowPVPDuelsGameMode extends SinglePVPDuelsGameMode {
  @Field()
  public shotsFired: number;

  public constructor(data: APIData, title: string, mode: string, titleRequirement: TitleRequirement) {
    super(data, title, mode, titleRequirement);
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

  public constructor(data: APIData, title: string, mode: string, titleRequirement: TitleRequirement) {
    super(data, mode);

    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = getTitleAndProgression({
      score: this.wins,
      mode: title,
      data,
      titleRequirement,
    });

    this.titleFormatted = titleFormatted;
    this.titleLevelFormatted = titleLevelFormatted;
    this.nextTitleLevelFormatted = nextTitleLevelFormatted;
    this.progression = progression;
  }
}

export class ArenaDuels extends SingleDuelsGameMode {
  @Field()
  public shotsFired: number;

  public constructor(data: APIData) {
    super(data, "Arena", "duel_arena", "default");
    this.shotsFired = data[`duel_arena_bow_shots`];
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

  @Field()
  public gapplesEaten: number;

  public constructor(data: APIData) {
    this.solo = new BowPVPBaseDuelsGameMode(data, "uhc_duel");
    this.doubles = new BowPVPBaseDuelsGameMode(data, "uhc_doubles");
    this.fours = new BowPVPBaseDuelsGameMode(data, "uhc_four");
    this.deathmatch = new BowPVPBaseDuelsGameMode(data, "uhc_meetup");

    this.overall = deepAdd(this.solo, this.doubles, this.fours, this.deathmatch);
    this.overall.winstreak = data.current_uhc_winstreak;
    this.overall.bestWinstreak = data.best_uhc_winstreak;
    BowPVPBaseDuelsGameMode.applyRatios(this.overall);

    this.gapplesEaten = add(
      data.uhc_duel_golden_apples_eaten,
      data.uhc_doubles_golden_apples_eaten,
      data.uhc_four_golden_apples_eaten,
      data.uhc_meetu_golden_apples_eaten
    );

    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = getTitleAndProgression({
      score: this.overall.wins,
      mode: "UHC",
      data,
      titleRequirement: "default",
    });

    this.titleFormatted = titleFormatted;
    this.titleLevelFormatted = titleLevelFormatted;
    this.nextTitleLevelFormatted = nextTitleLevelFormatted;
    this.progression = progression;
  }
}

export class SkyWarsDuels extends MultiPVPDuelsGameMode {
  @Field({ store: { default: "none" } })
  public kit: string;

  public constructor(data: APIData) {
    super(data, "SkyWars", "sw", "skywars", "default");

    const kit = data.sw_duels_kit_new3 ?? data.sw_duels_kit_new2 ?? data.sw_duels_kit_new ?? "none";
    this.kit = kit.replace("kit_", "").replaceAll("ranked_", "").replaceAll("mega_", "").replaceAll("defending_team_", "");
  }
}

export class BlitzSGDuels extends SingleBowPVPDuelsGameMode {
  @Field({ store: { default: "none" } })
  public kit: string;

  public constructor(data: APIData) {
    super(data, "Blitz", "blitz_duel", "default");
    this.kit = data.blitz_duels_kit ?? "none";
  }
}

export class QuakeDuels extends SinglePVPDuelsGameMode {
  @Field()
  public headshots: number;

  @Field()
  public shotsFired: number;

  public constructor(data: APIData) {
    super(data, "Quakecraft", "quake_duel", "default");
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

    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = getTitleAndProgression({
      score: this.overall.wins,
      mode: "Bed Wars",
      data,
      titleRequirement: "default",
    });

    this.titleFormatted = titleFormatted;
    this.titleLevelFormatted = titleLevelFormatted;
    this.nextTitleLevelFormatted = nextTitleLevelFormatted;
    this.progression = progression;
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

  @Field({ leaderboard: { name: "Spleef Overall Wins", fieldName: "Wins" } })
  public overallWins: number;

  @Field({ leaderboard: { fieldName: "Spleef" } })
  public spleef: SpleefDuelMode;

  @Field()
  public bowSpleef: BowSpleefDuelMode;

  public constructor(data: APIData) {
    this.spleef = new SpleefDuelMode(data);
    this.bowSpleef = new BowSpleefDuelMode(data);
    this.overallWins = add(this.spleef.wins, this.bowSpleef.wins);

    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = getTitleAndProgression({
      score: this.overallWins,
      mode: "Spleef",
      data,
      titleRequirement: "default",
    });

    this.titleFormatted = titleFormatted;
    this.titleLevelFormatted = titleLevelFormatted;
    this.nextTitleLevelFormatted = nextTitleLevelFormatted;
    this.progression = progression;
  }
}

export class ParkourDuels extends SingleDuelsGameMode {
  @Field()
  public checkpoints: number;

  @Field({ leaderboard: { formatter: formatTime, sort: "ASC" } })
  public bestTime: number;

  public constructor(data: APIData) {
    super(data, "Parkour", "parkour_eight", "half");
    this.checkpoints = data.parkour_checkpoints_reached;
    this.bestTime = data.parkour_personal_best;
  }
}

export class MegaWallsDuels extends SinglePVPDuelsGameMode {
  public constructor(data: APIData) {
    super(data, "MW", "mw_duel", "half");

    // add back doubles stats
    const doubles = new PVPBaseDuelsGameMode(data, "mw_doubles");
    this.wins = add(this.wins, doubles.wins);
    this.losses = add(this.losses, doubles.losses);
    this.kills = add(this.kills, doubles.kills);
    this.deaths = add(this.deaths, doubles.deaths);
    this.blocksPlaced = add(this.blocksPlaced, doubles.blocksPlaced);

    PVPBaseDuelsGameMode.applyRatios(this);

    const { titleFormatted, titleLevelFormatted, nextTitleLevelFormatted, progression } = getTitleAndProgression({
      score: this.wins,
      mode: "MW",
      data,
      titleRequirement: "half",
    });

    this.titleFormatted = titleFormatted;
    this.titleLevelFormatted = titleLevelFormatted;
    this.nextTitleLevelFormatted = nextTitleLevelFormatted;
    this.progression = progression;
  }
}

// [INFO]: Hypixel doesn't seem to store MegaWalls Duels kits in the API
