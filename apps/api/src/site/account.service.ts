/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Account, AccountProfile, Player, User } from "@statsify/schemas";
import type { AccountPage } from "@statsify/contract";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { ORPCError } from "@orpc/nest";
import { Redis } from "ioredis";
import { config } from "@statsify/util";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { ReturnModelType } from "@typegoose/typegoose";

type AccountModel = ReturnModelType<typeof Account>;
type ProfileModel = ReturnModelType<typeof AccountProfile>;
type UserModel = ReturnModelType<typeof User>;
type PlayerModel = ReturnModelType<typeof Player>;

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const DISCORD_API = "https://discord.com/api/v10";
const DISCORD_TIMEOUT_MS = 5000;

// Redis keeps a hash of the cookie's token, so a copy of Redis can't be replayed as live sessions.
const sessionKey = (session: string) => `site:account:session:${createHash("sha256").update(session).digest("base64url")}`;
const normalizeUuid = (uuid: string) => uuid.replaceAll("-", "").toLowerCase();

/**
 * Site logins and the Minecraft profiles they own. Every method but `login` takes the visitor's session and acts for
 * its account alone, so the site's key can't act for anyone without that visitor's cookie.
 */
@Injectable()
export class AccountService {
  public constructor(
    @InjectModel(Account) private readonly accountModel: AccountModel,
    @InjectModel(AccountProfile) private readonly profileModel: ProfileModel,
    @InjectModel(User) private readonly userModel: UserModel,
    @InjectModel(Player) private readonly playerModel: PlayerModel,
    @InjectRedis() private readonly redis: Redis
  ) {}

  /** Swaps a Discord authorization code for the user's ID, finds or makes their account and opens a session. */
  public async login(code: string, redirectUri: string): Promise<{ session: string }> {
    const discordId = await this.discordUserId(code, redirectUri);

    const account = await this.accountModel
      .findOneAndUpdate(
        { discordId },
        { $setOnInsert: { id: randomUUID().replaceAll("-", ""), discordId, createdAt: Date.now() } },
        { upsert: true, new: true }
      )
      .orFail()
      .lean()
      .exec();

    await this.claimVerified(account);

    const session = randomBytes(32).toString("base64url");
    await this.redis.set(sessionKey(session), account.id, "EX", SESSION_TTL_SECONDS);
    return { session };
  }

  public async logout(session: string): Promise<void> {
    await this.redis.del(sessionKey(session));
  }

  public async get(session: string): Promise<AccountPage> {
    const account = await this.account(session);
    return this.page(account.id);
  }

  /** For a visitor who ran the bot's `/verify` since logging in. */
  public async recheck(session: string): Promise<AccountPage> {
    const account = await this.account(session);
    await this.claimVerified(account);
    return this.page(account.id);
  }

  public async setPrimary(session: string, uuid: string): Promise<AccountPage> {
    const account = await this.account(session);
    uuid = normalizeUuid(uuid);
    await this.requireOwned(account.id, uuid);

    await this.accountModel.updateOne({ id: account.id }, { $set: { primaryUuid: uuid } }).exec();
    await this.verifyBot(account.discordId, uuid);
    return this.page(account.id);
  }

  /** The primary can go only once another profile is primary, or when it's the account's last one. */
  public async unlink(session: string, uuid: string): Promise<AccountPage> {
    const account = await this.account(session);
    uuid = normalizeUuid(uuid);
    await this.requireOwned(account.id, uuid);

    if (account.primaryUuid === uuid) {
      if (await this.profileModel.exists({ accountId: account.id, uuid: { $ne: uuid } })) throw new ORPCError("CONFLICT");
      await this.accountModel.updateOne({ id: account.id }, { $unset: { primaryUuid: "" } }).exec();
      await this.verifyBot(account.discordId, undefined);
    }

    await this.profileModel.updateOne({ uuid }, { $unset: { accountId: "" } }).exec();
    return this.page(account.id);
  }

  public async dismissMoved(session: string): Promise<AccountPage> {
    const account = await this.account(session);
    await this.accountModel.updateOne({ id: account.id }, { $unset: { notices: "" } }).exec();
    return this.page(account.id);
  }

  private async account(session: string): Promise<Account> {
    const id = await this.redis.get(sessionKey(session));
    const account = id ? await this.accountModel.findOne({ id }).lean().exec() : null;
    if (!account) throw new ORPCError("UNAUTHORIZED");
    return account;
  }

  private async requireOwned(accountId: string, uuid: string) {
    if (!(await this.profileModel.exists({ uuid, accountId }))) throw new ORPCError("NOT_FOUND");
  }

  /**
   * Links the UUID the account's Discord user verified with the bot, moving it from any account that linked it before
   * that `/verify`, and makes it the primary, since the primary is the bot's verified UUID.
   */
  private async claimVerified(account: Account) {
    if (!account.discordId) return;

    const user = await this.userModel.findOne({ id: account.discordId }, { uuid: true, verifiedAt: true }).lean().exec();
    if (!user?.uuid) return;

    const { uuid } = user;
    const profile = await this.profileModel.findOne({ uuid }).lean().exec();

    if (profile?.accountId !== account.id) {
      // An account that linked it after this `/verify` proved it more recently, so it keeps it.
      if (profile?.accountId && profile.linkedAt > (user.verifiedAt ?? 0)) return;

      await this.profileModel
        .updateOne({ uuid }, { $set: { accountId: account.id, linkedAt: Date.now() } }, { upsert: true })
        .exec();

      if (profile?.accountId) await this.release(profile.accountId, uuid);
    }

    if (account.primaryUuid !== uuid) await this.accountModel.updateOne({ id: account.id }, { $set: { primaryUuid: uuid } }).exec();
  }

  /** Tells an account a profile moved away from it, and if it was the primary, hands that to its oldest other profile. */
  private async release(accountId: string, uuid: string) {
    const account = await this.accountModel
      .findOneAndUpdate({ id: accountId }, { $push: { notices: { uuid, movedAt: Date.now() } } })
      .lean()
      .exec();

    if (account?.primaryUuid !== uuid) return;

    const next = await this.profileModel.findOne({ accountId }).sort({ linkedAt: 1 }).lean().exec();

    await this.accountModel
      .updateOne({ id: accountId }, next ? { $set: { primaryUuid: next.uuid } } : { $unset: { primaryUuid: "" } })
      .exec();

    await this.verifyBot(account.discordId, next?.uuid);
  }

  /** Points the bot's verification for a Discord user at their account's primary, as `/verify` and `/unverify` would. */
  private async verifyBot(discordId: string | undefined, uuid: string | undefined) {
    if (!discordId) return;

    if (!uuid) {
      await this.userModel
        .updateOne({ id: discordId, uuid: { $exists: true } }, { $unset: { uuid: "" }, unverifiedAt: Date.now() })
        .exec();
      return;
    }

    await this.userModel.updateMany({ uuid, id: { $ne: discordId } }, { $unset: { uuid: "" } }).exec();
    await this.userModel.updateOne({ id: discordId }, { id: discordId, uuid, verifiedAt: Date.now() }, { upsert: true }).exec();
  }

  private async page(accountId: string): Promise<AccountPage> {
    const [account, profiles] = await Promise.all([
      this.accountModel.findOne({ id: accountId }).lean().exec(),
      this.profileModel.find({ accountId }).sort({ linkedAt: 1 }).lean().exec(),
    ]);

    if (!account) throw new ORPCError("UNAUTHORIZED");

    const notices = account.notices ?? [];

    const players = await this.playerModel
      .find({ uuid: { $in: [...profiles, ...notices].map(({ uuid }) => uuid) } }, { uuid: true, username: true, displayName: true })
      .lean()
      .exec();

    const byUuid = new Map(players.map((player) => [player.uuid, player]));

    return {
      profiles: profiles.map(({ uuid, linkedAt }) => ({
        uuid,
        username: byUuid.get(uuid)?.username ?? null,
        displayName: byUuid.get(uuid)?.displayName ?? null,
        linkedAt,
        primary: uuid === account.primaryUuid,
      })),
      moved: notices.map(({ uuid, movedAt }) => ({ uuid, username: byUuid.get(uuid)?.username ?? null, movedAt })),
    };
  }

  /** The code flow's two calls. The access token is used once here and never kept. */
  private async discordUserId(code: string, redirectUri: string): Promise<string> {
    const [clientId, clientSecret] = await Promise.all([
      config("site.discordLogin.clientId", { required: false }),
      config("site.discordLogin.clientSecret", { required: false }),
    ]);

    if (!clientId || !clientSecret) throw new Error("site.discordLogin needs both clientId and clientSecret");

    const signal = AbortSignal.timeout(DISCORD_TIMEOUT_MS);

    const token = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      signal,
    });

    // 400 `invalid_grant`: a used, expired or made-up code, or a redirect URI the authorize request didn't name.
    if (token.status === 400) throw new ORPCError("UNAUTHORIZED");
    if (!token.ok) throw new Error(`Discord's token exchange answered ${token.status}`);

    const { access_token: accessToken } = (await token.json()) as { access_token: string };

    const me = await fetch(`${DISCORD_API}/users/@me`, { headers: { Authorization: `Bearer ${accessToken}` }, signal });
    if (!me.ok) throw new Error(`Discord's users/@me answered ${me.status}`);

    const { id } = (await me.json()) as { id: string };
    return id;
  }
}
