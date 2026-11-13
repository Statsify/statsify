/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type DiscordTokens,
  applicationId,
  clientSecret,
  discordRequest,
  redirectUri,
  refreshTokens,
  revokeToken,
} from "./discord-oauth.js";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import {
  type Player,
  RoleConnection,
  User,
  getRoleConnectionMetadata,
} from "@statsify/schemas";
import { config } from "@statsify/util";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { ReturnModelType } from "@typegoose/typegoose";

const PUSH_INTERVAL = 3_600_000;
const EXPIRY_MARGIN = 60_000;

const tokenKey = await config("linkedRoles.tokenKey", { required: false });
const key = tokenKey ? Buffer.from(tokenKey, "base64") : undefined;

if (key && key.length !== 32)
  throw new Error("linkedRoles.tokenKey must be a base64 encoded 32 byte key");

const roleConnectionPath = `/users/@me/applications/${applicationId}/role-connection`;

@Injectable()
export class LinkedRolesService {
  private readonly logger = new Logger("LinkedRolesService");

  public readonly enabled = !!(applicationId && clientSecret && redirectUri && key);

  public constructor(
    @InjectModel(RoleConnection)
    private readonly roleConnectionModel: ReturnModelType<typeof RoleConnection>,
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>
  ) {}

  /**
   * @returns The stored connection, or null when the Discord user hasn't verified a Minecraft account
   */
  public async connect(tokens: DiscordTokens): Promise<RoleConnection | null> {
    const response = await discordRequest("GET", "/users/@me", tokens.access_token);
    const { id }: { id: string } = await response.json();
    const user = await this.userModel.findOne({ id }).select({ uuid: true }).lean().exec();

    if (!user?.uuid) {
      await revokeToken(tokens.refresh_token);
      return null;
    }

    return this.roleConnectionModel
      .findOneAndUpdate(
        { id },
        { id, uuid: user.uuid, pushedAt: Date.now(), ...encryptTokens(tokens) },
        { upsert: true, new: true }
      )
      .lean()
      .exec();
  }

  public async push(connection: RoleConnection, player: Player) {
    const accessToken = await this.getAccessToken(connection);
    if (!accessToken) return;

    await discordRequest("PUT", roleConnectionPath, accessToken, {
      platform_name: "Hypixel",
      platform_username: player.username,
      metadata: getRoleConnectionMetadata(player),
    });
  }

  public async onPlayerSave(player: Player) {
    if (!this.enabled) return;

    try {
      const now = Date.now();

      // Claiming the push in the same query keeps concurrent saves from pushing twice
      const connection = await this.roleConnectionModel
        .findOneAndUpdate(
          { uuid: player.uuid, pushedAt: { $lte: now - PUSH_INTERVAL } },
          { $set: { pushedAt: now } }
        )
        .lean()
        .exec();

      if (connection) await this.push(connection, player);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Moves a Discord user's connection to the account they just verified, and removes any other user's connection to it
   */
  public async onVerify(id: string, uuid: string) {
    if (!this.enabled) return;

    const others = await this.roleConnectionModel
      .find({ uuid, id: { $ne: id } })
      .lean()
      .exec();

    await Promise.all(others.map((connection) => this.disconnect(connection)));

    // The next save of the new account pushes its values
    await this.roleConnectionModel
      .updateOne({ id }, { $set: { uuid, pushedAt: 0 } })
      .exec();
  }

  public async onUnverify(id: string) {
    if (!this.enabled) return;

    const connection = await this.roleConnectionModel.findOne({ id }).lean().exec();
    if (connection) await this.disconnect(connection);
  }

  private async disconnect(connection: RoleConnection) {
    try {
      const accessToken = await this.getAccessToken(connection);

      if (accessToken) {
        await discordRequest("DELETE", roleConnectionPath, accessToken);
        await revokeToken(decrypt(connection.refreshToken));
      }
    } catch (error) {
      this.logger.error(error);
    } finally {
      await this.roleConnectionModel.deleteOne({ id: connection.id }).exec();
    }
  }

  private async getAccessToken(connection: RoleConnection) {
    if (connection.expiresAt > Date.now() + EXPIRY_MARGIN)
      return decrypt(connection.accessToken);

    const tokens = await refreshTokens(decrypt(connection.refreshToken));

    // The user removed Statsify from their authorized apps
    if (!tokens) {
      await this.roleConnectionModel.deleteOne({ id: connection.id }).exec();
      return;
    }

    // Discord rotates refresh tokens, so the old one stops working once this one is issued
    await this.roleConnectionModel
      .updateOne({ id: connection.id }, { $set: encryptTokens(tokens) })
      .exec();

    return tokens.access_token;
  }
}

const encryptTokens = (tokens: DiscordTokens) => ({
  accessToken: encrypt(tokens.access_token),
  refreshToken: encrypt(tokens.refresh_token),
  expiresAt: Date.now() + tokens.expires_in * 1000,
});

const encrypt = (text: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key!, iv);
  const data = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);

  return [iv, cipher.getAuthTag(), data].map((part) => part.toString("base64url")).join(".");
};

const decrypt = (payload: string) => {
  const [iv, tag, data] = payload.split(".").map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key!, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
};
