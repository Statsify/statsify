/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ChallengesSkyWars, SkyWarsMini, SkyWarsMode } from "./mode.js";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import { Progression } from "#progression";
import { add } from "@statsify/math";
import { getFormattedLevel, getIntendedLevelFormatted, getLevel, getLevelProgress, parseKit } from "./util.js";
import type { APIData } from "@statsify/util";

export const SKYWARS_MODES = new GameModes([
  { api: "overall" },
  { api: "solo" },
  { api: "doubles" },
  { api: "mini", hypixel: "mini_normal" },

  { hypixel: "solo_insane_lucky", formatted: "Lucky Solo" },
  { hypixel: "teams_insane_lucky", formatted: "Lucky Doubles" },
  { hypixel: "solo_insane_slime", formatted: "Slime Solo" },
  { hypixel: "teams_insane_slime", formatted: "Slime Doubles" },
  { hypixel: "solo_insane_rush", formatted: "Rush Solo" },
  { hypixel: "teams_insane_rush", formatted: "Rush Doubles" },
  { hypixel: "solo_normal", formatted: "Solo Normal" },
  { hypixel: "solo_insane", formatted: "Solo Insane" },
  { hypixel: "teams_normal", formatted: "Doubles Normal" },
  { hypixel: "teams_insane", formatted: "Doubles Insane" },
  { hypixel: "solo_insane_tnt_madness", formatted: "TNT Madness Solo" },
  { hypixel: "teams_insane_tnt_madness", formatted: "TNT Madness Doubles" },
  { hypixel: "mega_normal", formatted: "Mega" },
  { hypixel: "mega_doubles", formatted: "Mega Doubles" },
] as const);

export type SkyWarsModes = ExtractGameModes<typeof SKYWARS_MODES>;

export class SkyWars {
  @Field({
    leaderboard: {
      fieldName: "Level",
      hidden: true,
      formatter: (exp: number) => getLevel(exp),
      additionalFields: ["this.overall.wins", "this.overall.kills", "this.overall.kdr"],
    },
    historical: {
      hidden: false,
      fieldName: "EXP Gained",
      formatter: Number,
      additionalFields: ["this.level"],
    },
  })
  public exp: number;

  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field({
    leaderboard: { additionalFields: ["this.opals"] },
    historical: { enabled: false },
  })
  public souls: number;

  @Field({
    leaderboard: { additionalFields: ["this.souls"] },
    historical: { enabled: false },
  })
  public opals: number;

  @Field()
  public heads: number;

  @Field({ historical: { enabled: false } })
  public tokens: number;

  @Field()
  public potionsBrewed: number;

  @Field({
    leaderboard: { enabled: false },
    historical: { enabled: false, fieldName: "Levels Gained" },
  })
  public level: number;

  @Field({ store: { default: getIntendedLevelFormatted(0) } })
  public naturalLevelFormatted: string;

  @Field()
  public levelFormatted: string;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public progression: Progression;

  @Field()
  public overall: SkyWarsMode;

  @Field()
  public solo: SkyWarsMode;

  @Field()
  public doubles: SkyWarsMode;

  @Field()
  public mini: SkyWarsMini;

  @Field()
  public challenges: ChallengesSkyWars;

  public constructor(data: APIData, ap: APIData) {
    this.exp = data.skywars_experience ?? 0;
    this.coins = data.coins;
    this.souls = data.souls;
    this.opals = data.opals;
    this.heads = data.heads;
    this.tokens = data.cosmetic_tokens;
    this.potionsBrewed = ap.skywars_tonic_taker;

    this.level = getLevel(this.exp);

    this.naturalLevelFormatted = getIntendedLevelFormatted(this.level);
    this.nextLevelFormatted = getIntendedLevelFormatted(this.level + 1);

    const isBold = data.levelFormattedWithBrackets?.includes("§l") ?? false;
    const isUnderline = data.levelFormattedWithBrackets?.includes("§n") ?? false;
    const isStrikethrough = data.levelFormattedWithBrackets?.includes("§m") ?? false;

    this.levelFormatted = getFormattedLevel(
      this.level,
      data.active_scheme,
      data.active_emblem?.replace("_icon", ""),
      isBold,
      isUnderline,
      isStrikethrough
    );

    this.progression = getLevelProgress(this.exp, this.level);

    const normalKit = parseKit(
      data.activeKit_SOLO_random ? "random" : data.activeKit_SOLO
    );
    const insaneKit = parseKit(
      data.activeKit_TEAMS_random ? "random" : data.activeKit_TEAMS
    );

    const soloInsaneWins = data.wins_solo_insane;
    const soloNormalWins = data.wins_solo_normal;
    const doublesInsaneWins = data.wins_team_insane;
    const doublesNormalWins = data.wins_team_normal;

    const chooseKit = (insane = 0, normal = 0) =>
      insane > normal ? insaneKit : normalKit;

    this.overall = new SkyWarsMode(data, "");

    this.solo = new SkyWarsMode(data, "solo");
    this.solo.kit = chooseKit(soloInsaneWins, soloNormalWins);

    this.doubles = new SkyWarsMode(data, "team");
    this.doubles.kit = chooseKit(doublesInsaneWins, doublesNormalWins);

    this.overall.kit = chooseKit(
      add(soloInsaneWins, doublesInsaneWins),
      add(soloNormalWins, doublesNormalWins)
    );

    this.mini = new SkyWarsMini(data);
    this.mini.kit = parseKit(data.activeKit_SOLO);

    this.challenges = new ChallengesSkyWars(data);
  }
}

export * from "./mode.js";
