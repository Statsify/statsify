import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { User, VerifyCode } from '@statsify/schemas';
import { ReturnModelType } from '@typegoose/typegoose';

@Injectable()
export class UserService {
  public constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    @InjectModel(VerifyCode) private readonly verifyCodeModel: ReturnModelType<typeof VerifyCode>
  ) {}

  public findOne(idOrUuid: string): Promise<User | null> {
    const [tag, type] = this.parseTag(idOrUuid);
    return this.userModel.findOne().where(type).equals(tag).lean().exec();
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
}
