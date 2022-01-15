import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { Player } from '@statsify/schemas';
import type { ReturnModelType } from '@typegoose/typegoose';

@Injectable()
export class PlayerService {
  public constructor(
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>
  ) {}

  /**
   *
   * @param tag uuid or username
   */
  public findOne(tag: string) {
    const type = tag.length > 16 ? 'uuid' : 'usernameToLower';

    return this.playerModel
      .findOne()
      .where(type)
      .equals(tag.replace(/-/g, '').toLowerCase())
      .lean()
      .exec();
  }
}
