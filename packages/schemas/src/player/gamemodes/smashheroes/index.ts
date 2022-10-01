/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";
import { SmashHeroesKit, SmashHeroesMode } from "./mode";

const formatLevel = (level: number) => `§b${level}§6✶`;

enum SmashHeroesClass {
  BOTMUN = "Botmon",
  CAKE_MONSTER = "Cake Monster",
  DUSK_CRAWLER = "Void Crawler",
  FROSTY = "Cryomancer",
  GENERAL_CLUCK = "General Cluck",
  GOKU = "Karakot",
  GREEN_HOOD = "Green Hood",
  MARAUDER = "Marauder",
  PUG = "Pug",
  SANIC = "Sanic",
  SERGEANT_SHIELD = "Sgt. Shield",
  SHOOP_DA_WHOOP = "Shoop",
  SKULLFIRE = "Skullfire",
  SPODERMAN = "Spoderman",
  THE_BULK = "Bulk",
  TINMAN = "Tinman",
}

@GameType()
export class SmashHeroes {
  @Mode()
  @Field()
  public overall: SmashHeroesMode;

  @Mode("solo_normal")
  @Field()
  public solo: SmashHeroesMode;

  @Mode("2v2_normal")
  @Field()
  public doubles: SmashHeroesMode;

  @Mode("teams_normal")
  @Field()
  public teams: SmashHeroesMode;

  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field({ store: { default: formatLevel(0) } })
  public levelFormatted: string;

  @Field({ store: { default: "none" } })
  public kit: string;

  @Mode()
  @Field()
  public cakeMonster: SmashHeroesKit;

  @Mode()
  @Field()
  public generalCluck: SmashHeroesKit;

  @Mode()
  @Field()
  public tinman: SmashHeroesKit;

  @Mode()
  @Field()
  public spoderman: SmashHeroesKit;

  @Mode()
  @Field()
  public skullfire: SmashHeroesKit;

  @Mode()
  @Field()
  public karakot: SmashHeroesKit;

  @Mode()
  @Field()
  public bulk: SmashHeroesKit;

  @Mode()
  @Field()
  public botman: SmashHeroesKit;

  @Mode()
  @Field()
  public sanic: SmashHeroesKit;

  @Mode()
  @Field()
  public marauder: SmashHeroesKit;

  @Mode()
  @Field()
  public voidCrawler: SmashHeroesKit;

  @Mode()
  @Field()
  public pug: SmashHeroesKit;

  @Mode()
  @Field()
  public sergeantShield: SmashHeroesKit;

  @Mode()
  @Field()
  public cryomancer: SmashHeroesKit;

  @Mode()
  @Field()
  public shoop: SmashHeroesKit;

  @Mode()
  @Field()
  public greenHood: SmashHeroesKit;

  public constructor(data: APIData) {
    this.overall = new SmashHeroesMode(data, "");
    this.solo = new SmashHeroesMode(data, "normal");
    this.doubles = new SmashHeroesMode(data, "2v2");
    this.teams = new SmashHeroesMode(data, "teams");

    this.botman = new SmashHeroesKit("BOTMUN", data.class_stats);
    this.bulk = new SmashHeroesKit("THE_BULK", data.class_stats);
    this.cakeMonster = new SmashHeroesKit("CAKE_MONSTER", data.class_stats);
    this.cryomancer = new SmashHeroesKit("FROSTY", data.class_stats);
    this.generalCluck = new SmashHeroesKit("GENERAL_CLUCK", data.class_stats);
    this.greenHood = new SmashHeroesKit("GREEN_HOOD", data.class_stats);
    this.karakot = new SmashHeroesKit("GOKU", data.class_stats);
    this.marauder = new SmashHeroesKit("MARAUDER", data.class_stats);
    this.pug = new SmashHeroesKit("PUG", data.class_stats);
    this.sanic = new SmashHeroesKit("SANIC", data.class_stats);
    this.sergeantShield = new SmashHeroesKit("SERGEANT_SHIELD", data.class_stats);
    this.shoop = new SmashHeroesKit("SHOOP_DA_WHOOP", data.class_stats);
    this.skullfire = new SmashHeroesKit("SKULLFIRE", data.class_stats);
    this.spoderman = new SmashHeroesKit("SPODERMAN", data.class_stats);
    this.tinman = new SmashHeroesKit("TINMAN", data.class_stats);
    this.voidCrawler = new SmashHeroesKit("DUSK_CRAWLER", data.class_stats);

    this.coins = data.coins;
    this.level = data.smashLevel;
    this.kit =
      SmashHeroesClass[data.active_class as keyof typeof SmashHeroesClass] ?? "none";
    this.levelFormatted = formatLevel(this.level ?? 0);
  }
}

export type SmashHeroesModes = StatsifyApiModes<SmashHeroes>;
export const SMASH_HEROES_MODES = new GameModes<SmashHeroesModes>([
  ...GetMetadataModes(SmashHeroes),

  { hypixel: "1v1_normal", formatted: "1v1" },
  { hypixel: "friends_normal", formatted: "Friends" },
]);

export * from "./mode";
