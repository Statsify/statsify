import {
  ApiService as StatsifyApiService,
  GuildNotFoundException,
  GuildQuery,
  PlayerNotFoundException,
  RankedSkyWarsNotFoundException,
  RecentGamesNotFoundException,
  StatusNotFoundException,
} from '@statsify/api-client';
import { ErrorMessage } from '@statsify/discord';
import { User } from '@statsify/schemas';
import short from 'short-uuid';
import { Service } from 'typedi';

type PlayerTag = 'username' | 'uuid' | 'discordId' | 'none';

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

      if (error.message === 'player') throw this.missingPlayer(type, tag);

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
      const error = err.response.data as RecentGamesNotFoundException | PlayerNotFoundException;

      if (error.message === 'player') throw this.missingPlayer(type, tag);

      if (error.message === 'recentGames')
        throw new ErrorMessage(
          'Recent Games not found',
          `Recent games for ${
            (error as RecentGamesNotFoundException).displayName
          } could not be found`
        );

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
      const error = err.response.data as StatusNotFoundException | PlayerNotFoundException;

      if (error.message === 'player') throw this.missingPlayer(type, tag);

      if (error.message === 'status')
        throw new ErrorMessage(
          'Status not found',
          `A status for ${(error as StatusNotFoundException).displayName} could not be found`
        );

      throw this.unknownError();
    });
  }

  /**
   *
   * @param tag Username, UUID, or Discord ID, or nothing. If nothing is provided it will attempt to fall back on the provided user.
   * @param page Page number to get.
   * @param user User to use if no tag is provided.
   * @returns The friends of the player at the page.
   */
  public override async getFriends(tag: string, page: number, user: User | null = null) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super.getFriends(input, page).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();
      const error = err.response.data as PlayerNotFoundException;

      if (error.message === 'player') throw this.missingPlayer(type, tag);

      throw this.unknownError();
    });
  }

  /**
   *
   * @param tag Username, UUID, or Discord ID, or nothing. If nothing is provided it will attempt to fall back on the provided user.
   * @param user User to use if no tag is provided.
   * @returns The player's ranked skywars stats
   */
  public override async getRankedSkyWars(tag: string, user: User | null = null) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super.getRankedSkyWars(input).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();
      const error = err.response.data as RankedSkyWarsNotFoundException | PlayerNotFoundException;

      if (error.message === 'player') throw this.missingPlayer(type, tag);

      if (error.message === 'rankedSkyWars')
        throw new ErrorMessage(
          'Ranked SkyWars stats not found',
          `${(error as RankedSkyWarsNotFoundException).displayName} has no Ranked SkyWars stats.`
        );

      throw this.unknownError();
    });
  }

  /**
   *
   * @param tag Username, UUID, or Discord ID, or nothing. If nothing is provided it will attempt to fall back on the provided user.
   * @param user User to use if no tag is provided.
   * @returns The achievements of the player.
   */
  public override async getAchievements(tag: string, user: User | null = null) {
    const [formattedTag, type] = this.parseTag(tag);
    const input = await this.resolveTag(formattedTag, type, user);

    return super.getAchievements(input).catch((err) => {
      if (!err.response || !err.response.data) throw this.unknownError();
      const error = err.response.data as PlayerNotFoundException;

      if (error.message === 'player') throw this.missingPlayer(type, tag);

      throw this.unknownError();
    });
  }

  public override async getGuild(tag: string, type?: GuildQuery, user: User | null = null) {
    let input: string;
    let playerType: PlayerTag;

    if (!type) {
      if (!tag || this.isDiscordId(tag)) type = GuildQuery.PLAYER;
      else if (tag.match(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)) type = GuildQuery.ID;
      else if (tag.includes(' ') || tag.length > 16) type = GuildQuery.NAME;
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

      if (error.message === 'guild')
        throw new ErrorMessage(
          'Invalid Guild',
          `A guild by the ${type?.toLowerCase()} of \`${tag}\` could not be found!`
        );

      if (error.message === 'player') throw this.missingPlayer(playerType, tag);

      throw this.unknownError();
    });
  }

  private async resolveTag(tag: string, type: PlayerTag, user: User | null) {
    if (type === 'discordId') {
      const searchedUser = await this.getUser(tag);
      if (searchedUser?.uuid) return searchedUser.uuid;

      throw new ErrorMessage(
        'Missing Verification',
        `<@${tag}> is not **verified**. To mention them, they must run \`/verify\` to verify their account.`
      );
    }

    if (type === 'none') {
      if (user?.uuid) return user.uuid;
      throw new ErrorMessage('Missing Verification', 'You are not verified');
    }

    return tag;
  }

  private parseTag(tag: string): [input: string, type: PlayerTag] {
    if (!tag) return ['', 'none'];

    const length = tag.length;

    if (length >= 32 && length <= 36) return [tag.replace(/-/g, ''), 'uuid'];
    if (length <= 16) return [tag, 'username'];

    if (this.isDiscordId(tag)) return [tag.replace(/<@|!|>/g, ''), 'discordId'];

    if (length == 20) {
      const shortUuid = this.translator.toUUID(tag);
      return [shortUuid.replace(/-/g, ''), 'uuid'];
    }

    throw new ErrorMessage(
      'Invalid Search',
      "We couldn't tell what you were looking for!\nPlease enter a username, uuid, or discord mention."
    );
  }

  private missingPlayer(type: PlayerTag, tag: string) {
    return new ErrorMessage(
      'Invalid Player',
      `A player by the ${type} of \`${tag}\` could not be found!`
    );
  }

  private unknownError() {
    return new ErrorMessage(
      'An Unknown Error Occurred',
      'Something went wrong, please try again later.'
    );
  }

  private isDiscordId(tag: string) {
    return Boolean(tag.match(/^<@!?(\d{17,19})>$/)) || Boolean(tag.match(/^\d{17,19}$/m));
  }
}
