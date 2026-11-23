/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectModel } from "@m8a/nestjs-typegoose";
import { Injectable, NotFoundException } from "@nestjs/common";
import { User, VerifyCode } from "@statsify/schemas";
import { config, flatten, isUuid, normalizeUuid } from "@statsify/util";
import { getLogoPath } from "@statsify/assets";
import { readFile, rm, writeFile } from "node:fs/promises";
import type { ReturnModelType } from "@typegoose/typegoose";

const mediaRoute = await config("api.mediaRoot");

@Injectable()
export class UserService {
  public constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    @InjectModel(VerifyCode)
    private readonly verifyCodeModel: ReturnModelType<typeof VerifyCode>
  ) {}

  public get(idOrUuid: string): Promise<User | null> {
    const [tag, type] = parseTag(idOrUuid);
    return this.userModel.findOne().where(type).equals(tag).lean().exec();
  }

  public update(idOrUuid: string, user: Partial<User>): Promise<User | null> {
    const [tag, type] = parseTag(idOrUuid);

    return this.userModel
      .findOneAndUpdate({ [type]: tag }, { $set: flatten(user) })
      .lean()
      .exec();
  }

  public async getBadge(idOrUuid: string): Promise<Buffer> {
    const [tag, type] = parseTag(idOrUuid);
    const user = await this.userModel.findOne().where(type).equals(tag).lean().exec();

    if (!user) throw new NotFoundException("user");

    let badgePath: string | undefined = undefined;

    if (user.hasBadge && User.isGold(user)) {
      badgePath = getBadgePath(user.id);
    } else if (user.tier) {
      badgePath = getLogoPath(user);
    } else if (user.uuid) {
      badgePath = getLogoPath("verified", 28);
    }

    if (!badgePath) throw new NotFoundException("badge");

    return readFile(badgePath);
  }

  public async updateBadge(idOrUuid: string, badge: Buffer): Promise<void> {
    const [tag, type] = parseTag(idOrUuid);
    const user = await this.userModel.findOne().where(type).equals(tag).lean().exec();

    if (!user) throw new NotFoundException("user");

    await this.userModel
      .updateOne({ hasBadge: true })
      .where("id")
      .equals(user.id)
      .lean()
      .exec();

    await writeFile(getBadgePath(user.id), badge);
  }

  public async deleteBadge(idOrUuid: string): Promise<void> {
    const [tag, type] = parseTag(idOrUuid);

    const user = await this.userModel
      .findOneAndUpdate({ [type]: tag }, { hasBadge: false })
      .lean()
      .exec();

    if (!user) throw new NotFoundException("user");

    await rm(getBadgePath(user.id), { force: true });
  }

  public async verifyUser(
    uuidOrCode: string,
    id: string,
  ): Promise<User | null> {
    const uuid =
      isUuid(uuidOrCode) ?
        normalizeUuid(uuidOrCode) :
        await this.getUuidFromCode(uuidOrCode);

    // Unverify anyone previously linked to this UUID
    await this.userModel
      .updateMany({ uuid }, { $unset: { uuid: "" } })
      .lean()
      .exec();

    // Link the discord id to the UUID
    const user = await this.userModel
      .findOneAndUpdate(
        { id },
        { id, uuid, verifiedAt: Date.now() },
        { upsert: true, new: true }
      )
      .lean()
      .exec();

    return user;
  }

  public async unverifyUser(idOrUuid: string): Promise<User | null> {
    const [tag, type] = parseTag(idOrUuid);

    const user = await this.userModel
      .findOneAndUpdate(
        { [type]: tag },
        { $unset: { uuid: "" }, unverifiedAt: Date.now() },
        { new: true },
      )
      .lean()
      .exec();

    return user;
  }

  private async getUuidFromCode(code: string): Promise<string> {
    const verifyCode = await this.verifyCodeModel
      .findOneAndDelete()
      .where("code")
      .equals(code)
      .lean()
      .exec();

    if (!verifyCode) throw new NotFoundException("verifyCode");

    return verifyCode.uuid;
  }
}

const parseTag = (tag: string): [tag: string, type: string] =>
  isUuid(tag) ? [normalizeUuid(tag), "uuid"] : [tag, "id"];

const getBadgePath = (id: string) => `${mediaRoute}/badges/${id}.png`;
