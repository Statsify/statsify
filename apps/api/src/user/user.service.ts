/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectModel } from "@m8a/nestjs-typegoose";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { User, VerifyCode } from "@statsify/schemas";
import { config } from "@statsify/util";
import { getAssetPath, getLogoPath } from "@statsify/assets";
import { readFile, rm, writeFile } from "node:fs/promises";

@Injectable()
export class UserService {
  public constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    @InjectModel(VerifyCode)
    private readonly verifyCodeModel: ReturnModelType<typeof VerifyCode>
  ) {}

  public get(idOrUuid: string): Promise<User | null> {
    const [tag, type] = this.parseTag(idOrUuid);
    return this.userModel.findOne().where(type).equals(tag).lean().exec();
  }

  public async getBadge(idOrUuid: string): Promise<Buffer> {
    const [tag, type] = this.parseTag(idOrUuid);
    const user = await this.userModel.findOne().where(type).equals(tag).lean().exec();

    if (!user) throw new NotFoundException(`user`);

    const isPremium = User.isPremium(user.tier);

    let badgePath: string | undefined = undefined;

    if (user.hasBadge && isPremium) {
      badgePath = this.getBadgePath(user.id);
    } else if (isPremium) {
      badgePath = getLogoPath(user.tier);
    } else if (user.uuid) {
      badgePath = getAssetPath(`logos/verified_logo_30.png`);
    }

    if (!badgePath) throw new NotFoundException(`badge`);

    return readFile(badgePath);
  }

  public async updateBadge(idOrUuid: string, badge: Buffer): Promise<void> {
    const [tag, type] = this.parseTag(idOrUuid);
    const user = await this.userModel.findOne().where(type).equals(tag).lean().exec();

    if (!user) throw new NotFoundException(`user`);

    await this.userModel
      .updateOne({ hasBadge: true })
      .where("id")
      .equals(user.id)
      .lean()
      .exec();
    await writeFile(this.getBadgePath(user.id), badge);
  }

  public async deleteBadge(idOrUuid: string): Promise<void> {
    const [tag, type] = this.parseTag(idOrUuid);

    const user = await this.userModel
      .findOneAndUpdate({ hasBadge: false })
      .where(type)
      .equals(tag)
      .lean()
      .exec();

    if (!user) throw new NotFoundException(`user`);

    await rm(this.getBadgePath(user.id));
  }

  public async verifyUser(code: string, id: string): Promise<User | null> {
    const verifyCode = await this.verifyCodeModel
      .findOne()
      .where("code")
      .equals(code)
      .lean()
      .exec();

    if (!verifyCode) return null;

    const { uuid } = verifyCode;

    //Unverify anyone previously linked to this UUID
    await this.userModel
      .updateMany({ uuid }, { $unset: { uuid: "" } })
      .lean()
      .exec();

    //Link the discord id to the UUID
    const user = await this.userModel
      .findOneAndUpdate(
        { id },
        { id, uuid, verifiedAt: Date.now() },
        { upsert: true, new: true }
      )
      .lean()
      .exec();

    //Delete the verify code
    await this.verifyCodeModel.deleteOne({ code }).lean().exec();

    return user;
  }

  public async unverifyUser(idOrUuid: string): Promise<User | null> {
    const [tag, type] = this.parseTag(idOrUuid);

    const user = await this.userModel
      .findOneAndUpdate(
        { [type]: tag },
        { $unset: { uuid: "" }, unverifiedAt: Date.now() },
        { new: true }
      )
      .lean()
      .exec();

    return user;
  }

  private parseTag(tag: string): [tag: string, type: string] {
    tag = tag.replaceAll("-", "");
    const type = tag.length >= 32 ? "uuid" : "id";

    return [tag, type];
  }

  private getBadgePath(id: string) {
    return `${config("api.mediaRoot")}/badges/${id}.png`;
  }
}
