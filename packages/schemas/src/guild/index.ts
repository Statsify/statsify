/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Color } from "../color";
import { ExpByGame } from "./expbygame";
import { Field } from "../metadata";
import { GameCode, GameIdMapping } from "../game";
import { GuildAchievements } from "./achievements";
import { GuildMember } from "./member";
import { GuildRank } from "./rank";
import { Progression } from "../progression";
import { getLevel } from "./util";

const limit = 100_000;

export class Guild {
  @Field({ mongo: { index: true, unique: true }, store: { required: true } })
  public id: string;

  @Field()
  public name: string;

  @Field({ mongo: { index: true, lowercase: true }, store: { required: true } })
  public nameToLower: string;

  @Field()
  public nameFormatted: string;

  @Field({ store: { required: false } })
  public description?: string;

  @Field({ leaderboard: { enabled: false } })
  public createdAt: number;

  @Field({
    leaderboard: { fieldName: "Level", hidden: true, additionalFields: ["level"], limit },
  })
  public exp: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field()
  public progression: Progression;

  @Field({ type: () => [GuildMember] })
  public members: GuildMember[];

  @Field({ type: () => [GuildRank] })
  public ranks: GuildRank[];

  @Field({ leaderboard: { fieldName: "Achievements -" } })
  public achievements: GuildAchievements;

  @Field({ type: () => [String] })
  public preferredGames: GameCode[];

  @Field({ store: { default: true } })
  public publiclyListed: boolean;

  @Field()
  public tag: string;

  @Field()
  public tagColor: Color;

  @Field()
  public tagFormatted: string;

  @Field({ leaderboard: { fieldName: "GEXP -" } })
  public expByGame: ExpByGame;

  @Field({ type: () => [Number] })
  public expHistory: number[];

  @Field({ type: () => [String] })
  public expHistoryDays: string[];

  @Field({ type: () => [Number] })
  public scaledExpHistory: number[];

  @Field({ leaderboard: { limit, name: "Daily GEXP", fieldName: "GEXP" } })
  public daily: number;

  @Field({ leaderboard: { limit, name: "Weekly GEXP", fieldName: "GEXP" } })
  public weekly: number;

  @Field({ leaderboard: { limit, name: "Monthly GEXP", fieldName: "GEXP" } })
  public monthly: number;

  @Field({ leaderboard: { limit, name: "Scaled Daily GEXP", fieldName: "GEXP" } })
  public scaledDaily: number;

  @Field({ leaderboard: { limit, name: "Scaled Weekly GEXP", fieldName: "GEXP" } })
  public scaledWeekly: number;

  @Field({ leaderboard: { limit, name: "Scaled Monthly GEXP", fieldName: "GEXP" } })
  public scaledMonthly: number;

  @Field({ leaderboard: { limit } })
  public questParticipation: number;

  @Field({ leaderboard: { enabled: false } })
  public expiresAt: number;

  @Field({ store: { store: false } })
  public cached?: boolean;

  public constructor(data: APIData = {}) {
    this.id = data._id;
    this.name = data.name;
    this.nameToLower = this.name?.toLowerCase();
    this.description = data.description;

    this.createdAt = data.created;

    this.tag = data.tag;
    this.tagColor = new Color(data.tagColor ?? "GRAY");
    this.tagFormatted = this.tag ? `${this.tagColor}[${this.tag}${this.tagColor}]` : "";

    this.nameFormatted = `${this.tagColor}${this.name}${
      this.tagFormatted ? ` ${this.tagFormatted}` : ""
    }`;

    this.exp = data.exp;

    const { level, current, max } = getLevel(this.exp);

    this.level = level;
    this.progression = new Progression(current, max);
    this.expByGame = new ExpByGame(data.guildExpByGameType ?? {});

    this.achievements = new GuildAchievements(this.level, data.achievements ?? {});

    this.preferredGames = (data.preferredGames ?? [])
      .map((g: GameCode) => GameIdMapping[g])
      .filter(Boolean);

    this.publiclyListed = data.publiclyListed;

    this.daily = 0;
    this.weekly = 0;
    this.monthly = 0;

    this.scaledDaily = 0;
    this.scaledWeekly = 0;
    this.scaledMonthly = 0;

    this.questParticipation = 0;

    this.expHistory = [];
    this.expHistoryDays = [];
    this.scaledExpHistory = [];
    this.members = [];

    if (data.members) {
      for (const member of data.members) {
        this.members.push(new GuildMember(member));
      }
    }

    this.ranks = [
      new GuildRank({
        name: "Guild Master",
        tag: data.hideGmTag ? null : "GM",
        priority: Number.MAX_SAFE_INTEGER,
        defualt: false,
      }),
    ];

    if (data.ranks) {
      for (const rank of data.ranks) {
        this.ranks.push(new GuildRank(rank));
      }
    }

    this.ranks = this.ranks.sort((a, b) => b.priority - a.priority);
  }
}

export * from "./achievements";
export * from "./member";
export * from "./rank";
export * from "./expbygame";
