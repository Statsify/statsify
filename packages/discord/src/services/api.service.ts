/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AxiosError } from "axios";
import { ButtonBuilder, LocalizeFunction } from "#messages";
import { ButtonStyle } from "discord-api-types/v10";
import { Color, User } from "@statsify/schemas";
import {
  CurrentHistoricalType,
  GUILD_ID_REGEX,
  GuildNotFoundException,
  GuildQuery,
  HistoricalTimes,
  HistoricalType,
  HypixelCache,
  LeaderboardQuery,
  PlayerNotFoundException,
  RecentGamesNotFoundException,
  ApiService as StatsifyApiService,
  StatusNotFoundException,
} from "@statsify/api-client";
import { ErrorMessage } from "#util/error.message";
import { Service } from "typedi";
import { config, removeFormatting } from "@statsify/util";

type PlayerTag = "username" | "uuid" | "discordId" | "none";

@Service()
export class ApiService extends StatsifyApiService {
  public constructor() {
    super(config("apiClient.route"), config("apiClient.key"));
  }

  /**
   *
   * @param tag Username, UUID, or Discord ID, or nothing. If nothing is provided it will attempt to fall back on the provided user.
   * @param user User to use if no tag is provided.
   * @returns a Player
   */
  public async getPlayer(tag: string, user: User | null = null) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super
      .getCachedPlayer(input, User.isGold(user) ? HypixelCache.LIVE : HypixelCache.CACHE)
      .catch((err) => {
        if (!err.response || !err.response.data) throw this.unknownError();
        const error = err.response.data as PlayerNotFoundException;

        if (error.message === "player") throw this.missingPlayer(type, tag);

        throw this.unknownError();
      });
  }

  public override async getPlayerHistorical(
    tag: string,
    historicalType: HistoricalType,
    create?: boolean,
    user: User | null = null
  ) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super.getPlayerHistorical(input, historicalType, create).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();
      const error = err.response.data as PlayerNotFoundException;

      if (error.message === "player") throw this.missingPlayer(type, tag);

      if (
        error.message === "historicalPlayer" &&
        historicalType === HistoricalTimes.SESSION
      ) {
        throw new ErrorMessage("errors.invalidSession");
      }

      console.log(error);
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
        const { displayName } = error as RecentGamesNotFoundException;

        throw new ErrorMessage(
          (t) => t("errors.noRecentGames.title"),
          (t) =>
            t("errors.noRecentGames.description", {
              displayName: this.emojiDisplayName(t, displayName),
            })
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
        const { displayName } = error as StatusNotFoundException;

        throw new ErrorMessage(
          (t) => t("errors.noStatus.title"),
          (t) =>
            t("errors.noStatus.description", {
              displayName: this.emojiDisplayName(t, displayName),
            })
        );
      }

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

      if (error.message === "guild") {
        if (type === GuildQuery.PLAYER) {
          const displayName = (error as GuildNotFoundException).displayName;

          throw new ErrorMessage(
            (t) => t("errors.playerNotInGuild.title"),
            (t) =>
              t("errors.playerNotInGuild.description", {
                displayName: this.emojiDisplayName(t, displayName ?? "ERROR"),
              })
          );
        }

        throw new ErrorMessage(
          (t) => t("errors.invalidGuild.title"),
          (t) =>
            t("errors.invalidGuild.description", {
              context: type?.toLowerCase(),
              tag: input,
            })
        );
      }

      if (error.message === "player") throw this.missingPlayer(playerType, input);

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
      throw new ErrorMessage("errors.leaderboardNotFound");
    });
  }

  public override getHistoricalLeaderboard(
    time: CurrentHistoricalType,
    field: string,
    input: string | number,
    type: LeaderboardQuery
  ) {
    return super
      .getHistoricalLeaderboard(time, field, input, type)
      .catch((err: AxiosError) => {
        if ((err.response?.data as PlayerNotFoundException).statusCode === 404)
          return null;
        throw new ErrorMessage("errors.leaderboardNotFound");
      });
  }

  public override getGuildLeaderboard(
    field: string,
    input: string | number,
    type: LeaderboardQuery
  ) {
    return super.getGuildLeaderboard(field, input, type).catch((err: AxiosError) => {
      if ((err.response?.data as GuildNotFoundException).statusCode === 404) return null;
      throw new ErrorMessage("errors.leaderboardNotFound");
    });
  }

  public emojiDisplayName(t: LocalizeFunction, displayName: string, space = true) {
    displayName = displayName.replaceAll("_", "\\_");

    const [rank, name] = displayName.replace(/\[|\]/g, "").split(" ");

    //They don't have a rank
    if (!name) return removeFormatting(displayName);

    const unformattedRank = removeFormatting(rank);

    const COLORED_RANKS = ["MVP+", "MVP++"];

    let emoji: string;

    if (COLORED_RANKS.includes(unformattedRank)) {
      const rankColor = unformattedRank === "MVP++" && rank.startsWith("§b") ? "b" : "";
      const plusColor = new Color(`§${rank[rank.indexOf("+") - 1]}`);
      emoji = t(`emojis:ranks.${rankColor}${unformattedRank}_${plusColor.id}`);
    } else {
      emoji = t(`emojis:ranks.${unformattedRank}`);
      emoji += " ";
    }

    return `${space ? " " : ""}${emoji}${removeFormatting(name)}`;
  }

  public parseTag(tag: string): [input: string, type: PlayerTag] {
    if (!tag) return ["", "none"];
    if (tag.includes(" ")) throw new ErrorMessage("errors.invalidSearch");

    const length = tag.length;

    if (length >= 32 && length <= 36) return [tag.replaceAll("-", ""), "uuid"];
    if (length <= 16) return [tag, "username"];

    if (this.isDiscordId(tag)) return [tag.replace(/<@|!|>/g, ""), "discordId"];

    throw new ErrorMessage("errors.invalidSearch");
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
      throw new ErrorMessage("errors.missingSelfVerification");
    }

    return tag;
  }

  public missingPlayer(type: PlayerTag, tag: string) {
    const buttons: ButtonBuilder[] = [];

    if (type !== "discordId") {
      const button = new ButtonBuilder()
        .label("NameMC")
        .style(ButtonStyle.Link)
        .url(encodeURI(`https://namemc.com/search?q=${tag}`));

      buttons.push(button);
    }

    return new ErrorMessage(
      (t) => t("errors.invalidPlayer.title"),
      (t) => t("errors.invalidPlayer.description", { context: type, tag }),
      { buttons }
    );
  }

  public unknownError() {
    return new ErrorMessage("errors.unknown");
  }

  private isDiscordId(tag: string) {
    return Boolean(/^<@!?(\d{17,19})>$/.test(tag)) || Boolean(/^\d{17,19}$/m.test(tag));
  }
}
