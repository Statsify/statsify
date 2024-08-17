/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime } from "@statsify/util";
import { Field } from "#metadata";
import { type GamePrefix, createPrefixProgression, defaultPrefix, getFormattedPrefix, rainbow } from "#prefixes";
import { Progression } from "#progression";
import { ratio } from "@statsify/math";

// Prefixes for TNT Run, PVP Run and Bow Spleef
const prefixes1: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 25 },
  { fmt: (n) => `§f[${n}]`, req: 100 },
  { fmt: (n) => `§2[${n}]`, req: 250 },
  { fmt: (n) => `§a[${n}]`, req: 500 },
  { fmt: (n) => `§9[${n}]`, req: 1000 },
  { fmt: (n) => `§5[${n}]`, req: 2500 },
  { fmt: (n) => `§6[${n}]`, req: 5000 },
  { fmt: (n) => `§c[${n}]`, req: 7500 },
  { fmt: (n) => `§0[${n}]`, req: 10_000 },
  { fmt: (n) => rainbow(`[${n}]`, true), req: 15_000 },
];

export class BowSpleef {
  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field({ leaderboard: { enabled: false } })
  public hits: number;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({ store: { default: defaultPrefix(prefixes1) } })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  public constructor(data: APIData) {
    this.wins = data.wins_bowspleef;
    this.hits = data.tags_bowspleef;
    this.losses = data.deaths_bowspleef;
    this.wlr = ratio(this.wins, this.losses);

    const score = this.wins ?? 0;

    this.currentPrefix = getFormattedPrefix({ prefixes: prefixes1, score, abbreviation: false });

    this.naturalPrefix = getFormattedPrefix({
      prefixes: prefixes1,
      score,
      trueScore: true,
      abbreviation: false,
    });

    this.nextPrefix = getFormattedPrefix({
      prefixes: prefixes1,
      score,
      skip: true,
      abbreviation: false,
    });

    this.progression = createPrefixProgression(prefixes1, score);
  }
}

export class PVPRun {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: { formatter: formatTime }, historical: { enabled: false } })
  public record: number;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({ store: { default: defaultPrefix(prefixes1) } })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  public constructor(data: APIData) {
    this.wins = data.wins_pvprun;
    this.kills = data.kills_pvprun;
    this.deaths = data.deaths_pvprun;
    this.kdr = ratio(this.kills, this.deaths);
    this.record = (data.record_pvprun ?? 0) * 1000;

    const score = this.wins ?? 0;

    this.currentPrefix = getFormattedPrefix({ prefixes: prefixes1, score, abbreviation: false });

    this.naturalPrefix = getFormattedPrefix({
      prefixes: prefixes1,
      score,
      trueScore: true,
      abbreviation: false,
    });

    this.nextPrefix = getFormattedPrefix({
      prefixes: prefixes1,
      score,
      skip: true,
      abbreviation: false,
    });

    this.progression = createPrefixProgression(prefixes1, score);
  }
}

export class TNTRun {
  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field({ leaderboard: { formatter: formatTime }, historical: { enabled: false } })
  public record: number;

  @Field()
  public potionsSplashed: number;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({ store: { default: defaultPrefix(prefixes1) } })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  public constructor(data: APIData) {
    this.wins = data.wins_tntrun;
    this.losses = data.deaths_tntrun;
    this.wlr = ratio(this.wins, this.losses);
    this.record = (data.record_tntrun ?? 0) * 1000;
    this.potionsSplashed = data.run_potions_splashed_on_players;

    const score = this.wins ?? 0;

    this.currentPrefix = getFormattedPrefix({ prefixes: prefixes1, score, abbreviation: false });

    this.naturalPrefix = getFormattedPrefix({
      prefixes: prefixes1,
      score,
      trueScore: true,
      abbreviation: false,
    });

    this.nextPrefix = getFormattedPrefix({
      prefixes: prefixes1,
      score,
      skip: true,
      abbreviation: false,
    });

    this.progression = createPrefixProgression(prefixes1, score);
  }
}

// Prefixes for TNT Tag and Wizards
const prefixes2: GamePrefix[] = [
  { fmt: (n) => `§8[${n}]`, req: 0 },
  { fmt: (n) => `§7[${n}]`, req: 15 },
  { fmt: (n) => `§f[${n}]`, req: 50 },
  { fmt: (n) => `§2[${n}]`, req: 100 },
  { fmt: (n) => `§a[${n}]`, req: 250 },
  { fmt: (n) => `§9[${n}]`, req: 500 },
  { fmt: (n) => `§5[${n}]`, req: 1000 },
  { fmt: (n) => `§6[${n}]`, req: 1500 },
  { fmt: (n) => `§c[${n}]`, req: 2500 },
  { fmt: (n) => `§0[${n}]`, req: 5000 },
  { fmt: (n) => rainbow(`[${n}]`, true), req: 10_000 },
];

export class TNTTag {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public tags: number;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({ store: { default: defaultPrefix(prefixes2) } })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  public constructor(data: APIData, ap: APIData) {
    this.wins = data.wins_tntag;
    this.kills = data.kills_tntag;
    this.deaths = data.deaths_tntag;
    this.kdr = ratio(this.kills, this.deaths);
    this.tags = ap?.tntgames_clinic;

    const score = this.wins ?? 0;

    this.currentPrefix = getFormattedPrefix({ prefixes: prefixes2, score, abbreviation: false });

    this.naturalPrefix = getFormattedPrefix({
      prefixes: prefixes2,
      score,
      trueScore: true,
      abbreviation: false,
    });

    this.nextPrefix = getFormattedPrefix({
      prefixes: prefixes2,
      score,
      skip: true,
      abbreviation: false,
    });

    this.progression = createPrefixProgression(prefixes2, score);
  }
}

export class WizardsClass {
  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  public constructor(data: APIData, clazz: string) {
    this.kills = data[`new_${clazz}_kills`];
    this.deaths = data[`new_${clazz}_deaths`];
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data[`new_${clazz}_assists`];
  }
}

export class Wizards {
  @Field({ store: { default: "none" } })
  public class: string;

  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field()
  public points: number;

  @Field({ leaderboard: { formatter: formatTime } })
  public airTime: number;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({ store: { default: defaultPrefix(prefixes2) } })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  @Field()
  public fireWizard: WizardsClass;

  @Field()
  public iceWizard: WizardsClass;

  @Field()
  public witherWizard: WizardsClass;

  @Field()
  public kineticWizard: WizardsClass;

  @Field()
  public bloodWizard: WizardsClass;

  @Field()
  public toxicWizard: WizardsClass;

  @Field()
  public hydroWizard: WizardsClass;

  @Field()
  public ancientWizard: WizardsClass;

  @Field()
  public arcaneWizard: WizardsClass;

  public constructor(data: APIData) {
    this.class = data.wizards_selected_class ?? "none";
    // Hypixel doesn't capitalize the word "Wizard" so the class name cant't be pretty printed
    this.class = this.class.replace("new_", "").replace("wizard", "Wizard");

    this.wins = data.wins_capture;
    this.kills = data.kills_capture;
    this.deaths = data.deaths_capture;
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data.assists_capture;
    this.points = data.points_capture;
    this.airTime = data.air_time_capture;

    const score = this.wins ?? 0;

    this.currentPrefix = getFormattedPrefix({ prefixes: prefixes2, score });

    this.naturalPrefix = getFormattedPrefix({
      prefixes: prefixes2,
      score,
      trueScore: true,
    });

    this.nextPrefix = getFormattedPrefix({
      prefixes: prefixes2,
      score,
      skip: true,
    });

    this.progression = createPrefixProgression(prefixes2, score);

    this.fireWizard = new WizardsClass(data, "firewizard");
    this.iceWizard = new WizardsClass(data, "icewizard");
    this.witherWizard = new WizardsClass(data, "witherwizard");
    this.kineticWizard = new WizardsClass(data, "kineticwizard");
    this.bloodWizard = new WizardsClass(data, "bloodwizard");
    this.toxicWizard = new WizardsClass(data, "toxicwizard");
    this.hydroWizard = new WizardsClass(data, "hydrowizard");
    this.ancientWizard = new WizardsClass(data, "ancientwizard");
    this.arcaneWizard = new WizardsClass(data, "arcanewizard");
  }
}

