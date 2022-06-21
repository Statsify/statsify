/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import short from "short-uuid";
import { AxiosError } from "axios";
import { Color, User } from "@statsify/schemas";
import { ErrorMessage } from "../error.message";
import {
  GUILD_ID_REGEX,
  GuildNotFoundException,
  GuildQuery,
  HistoricalType,
  LeaderboardQuery,
  PlayerNotFoundException,
  RecentGamesNotFoundException,
  ApiService as StatsifyApiService,
  StatusNotFoundException,
} from "@statsify/api-client";
import { Service } from "typedi";
import { removeFormatting } from "@statsify/util";
import { t } from "i18next";

type PlayerTag = "username" | "uuid" | "discordId" | "none";

@Service()
export class ApiService extends StatsifyApiService {
  private translator: short.Translator;

  public constructor() {
    super(process.env.API_ROUTE, process.env.API_KEY);
    this.translator = short(short.constants.cookieBase90);
  }

  /**
   *
   * @param tag Username, UUID, or Discord ID, or nothing. If nothing is provided it will attempt to fall back on the provided user.
   * @param user User to use if no tag is provided.
   * @returns a Player
   */
  public override async getPlayer(tag: string, user: User | null = null) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super.getPlayer(input).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();
      const error = err.response.data as PlayerNotFoundException;

      if (error.message === "player") throw this.missingPlayer(type, tag);

      throw this.unknownError();
    });
  }

  public override async getPlayerHistorical(
    tag: string,
    historicalType: HistoricalType,
    user: User | null = null
  ) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super.getPlayerHistorical(input, historicalType).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();
      const error = err.response.data as PlayerNotFoundException;

      if (error.message === "player") throw this.missingPlayer(type, tag);

      throw this.unknownError();
    });
  }

  /**
   *
   * @param tag Username, UUID, or Discord ID, or nothing. If nothing is provided it will attempt to fall back on the provided user.
   * @param user User to use if no tag is provided.
   * @returns The player's recent games
   */
  public override async getRecentGames(tag: string, user: User | null = null) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super.getRecentGames(input).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();
      const error = err.response.data as
        | RecentGamesNotFoundException
        | PlayerNotFoundException;

      if (error.message === "player") throw this.missingPlayer(type, tag);

      if (error.message === "recentGames") {
        const displayName = this.emojiDisplayName(
          (error as RecentGamesNotFoundException).displayName
        );

        throw new ErrorMessage(
          (t) => t("errors.noRecentGames.title"),
          (t) => t("errors.noRecentGames.description", { displayName })
        );
      }

      throw this.unknownError();
    });
  }

  /**
   *
   * @param tag Username, UUID, or Discord ID, or nothing. If nothing is provided it will attempt to fall back on the provided user.
   * @param user User to use if no tag is provided.
   * @returns The player's status
   */
  public override async getStatus(tag: string, user: User | null = null) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super.getStatus(input).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();
      const error = err.response.data as
        | StatusNotFoundException
        | PlayerNotFoundException;

      if (error.message === "player") throw this.missingPlayer(type, tag);

      if (error.message === "status") {
        const displayName = this.emojiDisplayName(
          (error as StatusNotFoundException).displayName
        );

        throw new ErrorMessage(
          (t) => t("errors.noStatus.title"),
          (t) => t("errors.noStatus.description", { displayName })
        );
      }

      throw this.unknownError();
    });
  }

  /**
   *
   * @param tag Username, UUID, or Discord ID, or nothing. If nothing is provided it will attempt to fall back on the provided user.
   * @param user User to use if no tag is provided.
   * @returns The friends of the player at the page.
   */
  public override async getFriends(tag: string, user: User | null = null) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super.getFriends(input).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();
      const error = err.response.data as PlayerNotFoundException;

      if (error.message === "player") throw this.missingPlayer(type, tag);

      throw this.unknownError();
    });
  }

  public override async getGuild(
    tag: string,
    type?: GuildQuery,
    user: User | null = null
  ) {
    let input: string;
    let playerType: PlayerTag;

    if (!type) {
      if (!tag || this.isDiscordId(tag)) type = GuildQuery.PLAYER;
      else if (GUILD_ID_REGEX.test(tag)) type = GuildQuery.ID;
      else if (tag.includes(" ") || tag.length > 16) type = GuildQuery.NAME;
      else type = GuildQuery.NAME;
    }

    if (type === GuildQuery.PLAYER) {
      const [formattedTag, type] = this.parseTag(tag);
      playerType = type;
      input = await this.resolveTag(formattedTag, type, user);
    } else {
      input = tag;
    }

    return super.getGuild(input, type).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();

      const error = err.response.data as GuildNotFoundException | PlayerNotFoundException;

      if (error.message === "guild")
        throw new ErrorMessage(
          (t) => t("errors.invalidGuild.title"),
          (t) => t("errors.invalidGuild.title", { type: type?.toLowerCase(), tag })
        );

      if (error.message === "player") throw this.missingPlayer(playerType, tag);

      throw this.unknownError();
    });
  }

  public override getPlayerLeaderboard(
    field: string,
    input: string | number,
    type: LeaderboardQuery
  ) {
    return super.getPlayerLeaderboard(field, input, type).catch((err: AxiosError) => {
      if ((err.response?.data as PlayerNotFoundException).statusCode === 404) return null;

      throw new ErrorMessage(
        (t) => t("errors.leaderboardNotFound.title"),
        (t) => t("errors.leaderboardNotFound.description")
      );
    });
  }

  public emojiDisplayName(displayName: string, space = true) {
    const [rank, name] = displayName
      .replaceAll("[|]", "")
      .replaceAll("_", "\\_")
      .split(" ");
    if (!rank) return removeFormatting(displayName);

    const unformattedRank = removeFormatting(rank);

    const COLORED_RANKS = ["MVP+", "MVP++"];

    let emoji: string;

    if (COLORED_RANKS.includes(unformattedRank)) {
      const rankColor = unformattedRank === "MVP++" && rank.startsWith("§b") ? "b" : "";
      const plusColor = new Color(`§${rank[rank.indexOf("+") - 1]}`);
      emoji = t(`emojis:ranks.${rankColor}${unformattedRank}_${plusColor.id}`);
    } else {
      emoji = t(`emojis:ranks.${unformattedRank}`);
      emoji += "";
    }

    return `${space ? " " : ""}${emoji}${removeFormatting(name)}`;
  }

  public parseTag(tag: string): [input: string, type: PlayerTag] {
    if (!tag) return ["", "none"];

    const length = tag.length;

    if (length >= 32 && length <= 36) return [tag.replaceAll("-", ""), "uuid"];
    if (length <= 16) return [tag, "username"];

    if (this.isDiscordId(tag)) return [tag.replaceAll("<@|!|>", ""), "discordId"];

    if (length == 20) {
      const shortUuid = this.translator.toUUID(tag);
      return [shortUuid.replaceAll("-", ""), "uuid"];
    }

    throw new ErrorMessage(
      (t) => t("errors.invalidSearch.title"),
      (t) => t("errors.invalidSearch.description")
    );
  }

  public async resolveTag(tag: string, type: PlayerTag, user: User | null) {
    if (type === "discordId") {
      const searchedUser = await this.getUser(tag);
      if (searchedUser?.uuid) return searchedUser.uuid;

      throw new ErrorMessage(
        (t) => t("errors.missingMentionVerification.title"),
        (t) => t("errors.missingMentionVerification.description", { tag })
      );
    }

    if (type === "none") {
      if (user?.uuid) return user.uuid;
      throw new ErrorMessage(
        (t) => t("errors.missingSelfVerification.title"),
        (t) => t("errors.missingSelfVerification.description")
      );
    }

    return tag;
  }

  public missingPlayer(type: PlayerTag, tag: string) {
    return new ErrorMessage(
      (t) => t("errors.invalidPlayer.title"),
      (t) => t("errors.invalidPlayer.description", { type, tag })
    );
  }

  public unknownError() {
    return new ErrorMessage(
      (t) => t("errors.unknown.title"),
      (t) => t("errors.unknown.description")
    );
  }

  private isDiscordId(tag: string) {
    return Boolean(/^<@!?(\d{17,19})>$/.test(tag)) || Boolean(/^\d{17,19}$/m.test(tag));
  }
}
