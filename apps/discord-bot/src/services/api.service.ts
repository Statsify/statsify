import { ApiService as StatsifyApiService } from '@statsify/api-client';
import { User } from '@statsify/schemas';
import short from 'short-uuid';
import { Service } from 'typedi';
import { ErrorResponse } from '../util';

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

    return super.getPlayer(input).catch(() => {
      throw this.missingPlayer(type, tag);
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

    return super.getRecentGames(input).catch(() => {
      throw this.missingPlayer(type, tag);
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

    return super.getStatus(input).catch(() => {
      throw this.missingPlayer(type, tag);
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

    return super.getFriends(input, page).catch(() => {
      throw this.missingPlayer(type, tag);
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

    return super.getRankedSkyWars(input).catch(() => {
      throw this.missingPlayer(type, tag);
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

    return super.getAchievements(input).catch(() => {
      throw this.missingPlayer(type, tag);
    });
  }

  private async resolveTag(tag: string, type: PlayerTag, user: User | null) {
    if (type === 'discordId') {
      const searchedUser = await this.getUser(tag);
      if (searchedUser?.uuid) return searchedUser.uuid;

      throw new ErrorResponse(
        'Missing Verification',
        `<@${tag}> is not **verified**. To mention them, they must run \`/verify\` to verify their account.`
      );
    }

    if (type === 'none') {
      if (user?.uuid) return user.uuid;
      throw new ErrorResponse('Missing Verification', 'You are not verified');
    }

    return tag;
  }

  private parseTag(tag: string): [input: string, type: PlayerTag] {
    if (!tag) return ['', 'none'];

    const length = tag.length;

    if (length >= 32 && length <= 36) return [tag.replace(/-/g, ''), 'uuid'];
    if (length <= 16) return [tag, 'username'];

    if (Boolean(tag.match(/^<@!?(\d{17,19})>$/)) || Boolean(tag.match(/^\d{17,19}$/m)))
      return [tag.replace(/<@|!|>/g, ''), 'discordId'];

    if (length == 20) {
      const shortUuid = this.translator.toUUID(tag);
      return [shortUuid.replace(/-/g, ''), 'uuid'];
    }

    throw new ErrorResponse(
      'Invalid Search',
      "We couldn't tell what you were looking for!\nPlease enter a username, uuid, or discord mention."
    );
  }

  private missingPlayer(type: PlayerTag, tag: string) {
    return new ErrorResponse(
      'Invalid Player',
      `A player by the ${type} of \`${tag}\` could not be found!`
    );
  }
}
