/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { BlitzSGKit } from "./kit";
import { BlitzSGMode, BlitzSGOverall } from "./mode";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import {
  GamePrefix,
  createPrefixProgression,
  defaultPrefix,
  getFormattedPrefix,
} from "../prefixes";
import { Progression } from "../../../progression";
import { sub } from "@statsify/math";

export const BLITZSG_MODES = new GameModes([
  { api: "overall" },
  { api: "arachnologist" },
  { api: "archer" },
  { api: "armorer" },
  { api: "astronaut" },
  { api: "baker" },
  { api: "blaze" },
  { api: "creepertamer" },
  { api: "diver" },
  { api: "donkeytamer" },
  { api: "farmer" },
  { api: "fisherman" },
  { api: "florist" },
  { api: "golem" },
  { api: "guardian" },
  { api: "horsetamer" },
  { api: "hunter" },
  { api: "hypetrain" },
  { api: "jockey" },
  { api: "knight" },
  { api: "meatmaster" },
  { api: "milkman" },
  { api: "necromancer" },
  { api: "paladin" },
  { api: "phoenix" },
  { api: "pigman" },
  { api: "rambo" },
  { api: "random" },
  { api: "ranger" },
  { api: "reaper" },
  { api: "reddragon" },
  { api: "rogue" },
  { api: "scout" },
  { api: "shadowknight" },
  { api: "shark" },
  { api: "slimeyslime" },
  { api: "snowman" },
  { api: "speleologist" },
  { api: "tim" },
  { api: "toxicologist" },
  { api: "troll" },
  { api: "viking" },
  { api: "warlock" },
  { api: "warrior" },
  { api: "wolftamer" },

  { hypixel: "solo_normal", formatted: "Solo" },
  { hypixel: "teams_normal", formatted: "Doubles" },
]);

const prefixes: GamePrefix[] = [
  { fmt: (n) => `§f[§7${n}§f]`, req: 0 },
  { fmt: (n) => `§e[${n}]`, req: 1000 },
  { fmt: (n) => `§a[${n}]`, req: 25_000 },
  { fmt: (n) => `§c[${n}]`, req: 50_000 },
  { fmt: (n) => `§b[${n}]`, req: 75_000 },
  { fmt: (n) => `§6§l[${n}]`, req: 100_000 },
  { fmt: (n) => `§5§l[${n}]`, req: 150_000 },
  { fmt: (n) => `§4§l[${n}]`, req: 200_000 },
  { fmt: (n) => `§9§l[${n}]`, req: 250_000 },
  { fmt: (n) => `§2§l[${n}]`, req: 300_000 },
];

export type BlitzSGModes = IGameModes<typeof BLITZSG_MODES>;

export class BlitzSG {
  @Field()
  public coins: number;

  @Field({ store: { default: "none" } })
  public kit: string;

  @Field()
  public overall: BlitzSGOverall;

  @Field()
  public solo: BlitzSGMode;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field({ store: { default: defaultPrefix(prefixes) } })
  public naturalPrefix: string;

  @Field()
  public nextPrefix: string;

  @Field()
  public doubles: BlitzSGMode;

  @Field({ store: { required: false } })
  public arachnologist: BlitzSGKit;

  @Field({ store: { required: false } })
  public archer: BlitzSGKit;

  @Field({ store: { required: false } })
  public armorer: BlitzSGKit;

  @Field({ store: { required: false } })
  public astronaut: BlitzSGKit;

  @Field({ store: { required: false } })
  public baker: BlitzSGKit;

  @Field({ store: { required: false } })
  public blaze: BlitzSGKit;

  @Field({ store: { required: false } })
  public creepertamer: BlitzSGKit;

  @Field({ store: { required: false } })
  public diver: BlitzSGKit;

  @Field({ store: { required: false } })
  public donkeytamer: BlitzSGKit;

  @Field({ store: { required: false } })
  public farmer: BlitzSGKit;

  @Field({ store: { required: false } })
  public fisherman: BlitzSGKit;

  @Field({ store: { required: false } })
  public florist: BlitzSGKit;

  @Field({ store: { required: false } })
  public golem: BlitzSGKit;

  @Field({ store: { required: false } })
  public guardian: BlitzSGKit;

  @Field({ store: { required: false } })
  public horsetamer: BlitzSGKit;

  @Field({ store: { required: false } })
  public hunter: BlitzSGKit;

  @Field({ store: { required: false } })
  public hypetrain: BlitzSGKit;

  @Field({ store: { required: false } })
  public jockey: BlitzSGKit;

  @Field({ store: { required: false } })
  public knight: BlitzSGKit;

  @Field({ store: { required: false } })
  public meatmaster: BlitzSGKit;

  @Field({ store: { required: false } })
  public milkman: BlitzSGKit;

  @Field({ store: { required: false } })
  public necromancer: BlitzSGKit;

  @Field({ store: { required: false } })
  public paladin: BlitzSGKit;

  @Field({ store: { required: false } })
  public phoenix: BlitzSGKit;

  @Field({ store: { required: false } })
  public pigman: BlitzSGKit;

  @Field({ store: { required: false } })
  public rambo: BlitzSGKit;

  @Field({ store: { required: false } })
  public random: BlitzSGKit;

  @Field({ store: { required: false } })
  public ranger: BlitzSGKit;

  @Field({ store: { required: false } })
  public reaper: BlitzSGKit;

  @Field({ store: { required: false } })
  public reddragon: BlitzSGKit;

  @Field({ store: { required: false } })
  public rogue: BlitzSGKit;

  @Field({ store: { required: false } })
  public scout: BlitzSGKit;

  @Field({ store: { required: false } })
  public shadowknight: BlitzSGKit;

  @Field({ store: { required: false } })
  public shark: BlitzSGKit;
  @Field({ store: { required: false } })
  public slimeyslime: BlitzSGKit;

  @Field({ store: { required: false } })
  public snowman: BlitzSGKit;

  @Field({ store: { required: false } })
  public speleologist: BlitzSGKit;

  @Field({ store: { required: false } })
  public tim: BlitzSGKit;

  @Field({ store: { required: false } })
  public toxicologist: BlitzSGKit;

  @Field({ store: { required: false } })
  public troll: BlitzSGKit;

  @Field({ store: { required: false } })
  public viking: BlitzSGKit;

  @Field({ store: { required: false } })
  public warlock: BlitzSGKit;

  @Field({ store: { required: false } })
  public warrior: BlitzSGKit;

  @Field({ store: { required: false } })
  public wolftamer: BlitzSGKit;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.kit = data.defaultkit || "none";

    this.overall = new BlitzSGOverall(data);

    const score = this.overall.kills;

    this.currentPrefix = getFormattedPrefix({ prefixes, score });

    this.naturalPrefix = getFormattedPrefix({
      prefixes,
      score,
      trueScore: true,
    });

    this.nextPrefix = getFormattedPrefix({
      prefixes,
      score,
      skip: true,
    });

    this.progression = createPrefixProgression(prefixes, score);

    this.solo = new BlitzSGMode(data, "");
    this.doubles = new BlitzSGMode(data, "teams_normal");

    this.solo.kills = sub(this.solo.kills, this.doubles.kills);

    this["arachnologist"] = new BlitzSGKit(data, "arachnologist");
    this["archer"] = new BlitzSGKit(data, "archer");
    this["armorer"] = new BlitzSGKit(data, "armorer");
    this["astronaut"] = new BlitzSGKit(data, "astronaut");
    this["baker"] = new BlitzSGKit(data, "baker");
    this["blaze"] = new BlitzSGKit(data, "blaze");
    this["creepertamer"] = new BlitzSGKit(data, "creepertamer");
    this["diver"] = new BlitzSGKit(data, "diver");
    this["donkeytamer"] = new BlitzSGKit(data, "donkeytamer");
    this["farmer"] = new BlitzSGKit(data, "farmer");
    this["fisherman"] = new BlitzSGKit(data, "fisherman");
    this["florist"] = new BlitzSGKit(data, "florist");
    this["golem"] = new BlitzSGKit(data, "golem");
    this["guardian"] = new BlitzSGKit(data, "guardian");
    this["horsetamer"] = new BlitzSGKit(data, "horsetamer");
    this["hunter"] = new BlitzSGKit(data, "hunter");
    this["hypetrain"] = new BlitzSGKit(data, "hype train");
    this["jockey"] = new BlitzSGKit(data, "jockey");
    this["knight"] = new BlitzSGKit(data, "knight");
    this["meatmaster"] = new BlitzSGKit(data, "meatmaster");
    this["milkman"] = new BlitzSGKit(data, "milkman");
    this["necromancer"] = new BlitzSGKit(data, "necromancer");
    this["paladin"] = new BlitzSGKit(data, "paladin");
    this["phoenix"] = new BlitzSGKit(data, "phoenix");
    this["pigman"] = new BlitzSGKit(data, "pigman");
    this["rambo"] = new BlitzSGKit(data, "rambo");
    this["random"] = new BlitzSGKit(data, "random");
    this["ranger"] = new BlitzSGKit(data, "ranger");
    this["reaper"] = new BlitzSGKit(data, "reaper");
    this["reddragon"] = new BlitzSGKit(data, "reddragon");
    this["rogue"] = new BlitzSGKit(data, "rogue");
    this["scout"] = new BlitzSGKit(data, "scout");
    this["shadowknight"] = new BlitzSGKit(data, "shadow knight");
    this["shark"] = new BlitzSGKit(data, "shark");
    this["slimeyslime"] = new BlitzSGKit(data, "slimeyslime");
    this["snowman"] = new BlitzSGKit(data, "snowman");
    this["speleologist"] = new BlitzSGKit(data, "speleologist");
    this["tim"] = new BlitzSGKit(data, "tim");
    this["toxicologist"] = new BlitzSGKit(data, "toxicologist");
    this["troll"] = new BlitzSGKit(data, "troll");
    this["viking"] = new BlitzSGKit(data, "viking");
    this["warlock"] = new BlitzSGKit(data, "warlock");
    this["warrior"] = new BlitzSGKit(data, "warrior");
    this["wolftamer"] = new BlitzSGKit(data, "wolftamer");
  }
}

export * from "./kit";
export * from "./mode";
