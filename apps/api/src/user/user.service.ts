import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { getAssetPath, getLogoPath } from '@statsify/assets';
import { User, VerifyCode } from '@statsify/schemas';
import { ReturnModelType } from '@typegoose/typegoose';
import { readFile, rm, writeFile } from 'fs/promises';

@Injectable()
export class UserService {
  public constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    @InjectModel(VerifyCode) private readonly verifyCodeModel: ReturnModelType<typeof VerifyCode>
  ) {}

  public get(idOrUuid: string): Promise<User | null> {
    const [tag, type] = this.parseTag(idOrUuid);
    return this.userModel.findOne().where(type).equals(tag).lean().exec();
  }

  public async getBadge(idOrUuid: string): Promise<Buffer> {
    const [tag, type] = this.parseTag(idOrUuid);
    const user = await this.userModel.findOne().where(type).equals(tag).lean().exec();

    if (!user) throw new NotFoundException(`user`);

    let badgePath: string | undefined = undefined;

    if (user.hasBadge && user.premium) {
      badgePath = this.getBadgePath(user.id);
    } else if (user.premium) {
      badgePath = getLogoPath(user.premium);
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

    await this.userModel.updateOne({ hasBadge: true }).where('id').equals(user.id).lean().exec();
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
      .where('code')
      .equals(code)
      .lean()
      .exec();

    if (!verifyCode) return null;

    const { uuid } = verifyCode;

    //Unverify anyone previously linked to this UUID
    await this.userModel
      .updateMany({ uuid }, { $unset: { uuid: '' } })
      .lean()
      .exec();

    //Link the discord id to the UUID
    const user = await this.userModel
      .findOneAndUpdate({ id }, { id, uuid, verifiedAt: Date.now() }, { upsert: true, new: true })
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
        { $unset: { uuid: '' }, unverifiedAt: Date.now() },
        { new: true }
      )
      .lean()
      .exec();

    return user;
  }

  private parseTag(tag: string): [tag: string, type: string] {
    tag = tag.replace(/-/g, '');
    const type = tag.length >= 32 ? 'uuid' : 'id';

    return [tag, type];
  }

  private getBadgePath(id: string) {
    return `${process.env.API_MEDIA_ROOT}/badges/${id}.png`;
  }
}
