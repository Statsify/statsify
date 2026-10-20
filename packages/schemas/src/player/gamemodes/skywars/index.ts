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

  @Field()
  public emblem: string;

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

    this.emblem = data.active_emblem;
    this.levelFormatted = getFormattedLevel(
      this.level,
      data.active_scheme,
      data.active_emblem?.replace("_icon", "")?.replace("emblem_", ""),
      isBold,
      isUnderline,
      isStrikethrough
    );

    this.progression = getLevelProgress(this.exp, this.level);

    const soloKit = parseKit(
      data.activeKit_SOLO_random ? "random" : data.activeKit_SOLO
    );
    const teamsKit = parseKit(
      data.activeKit_TEAMS_random ? "random" : data.activeKit_TEAMS
    );

    this.overall = new SkyWarsMode(data, "");

    this.solo = new SkyWarsMode(data, "solo");
    this.solo.kit = soloKit;

    this.doubles = new SkyWarsMode(data, "team");
    this.doubles.kit = teamsKit;

    this.overall.kit =
      (this.doubles.wins ?? 0) > (this.solo.wins ?? 0) ? teamsKit : soloKit;

    this.mini = new SkyWarsMini(data);
    this.mini.kit = parseKit(data.activeKit_MINI);

    this.challenges = new ChallengesSkyWars(data);
  }
}

export * from "./mode.js";
