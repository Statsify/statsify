import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { deserialize, Player, serialize } from '@statsify/schemas';
import type { ReturnModelType } from '@typegoose/typegoose';
import { HypixelService } from '../hypixel/hypixel.service';

@Injectable()
export class PlayerService {
  public constructor(
    private readonly hypixelService: HypixelService,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>
  ) {}

  /**
   *
   * @param tag uuid or username
   */
  public async findOne(tag: string) {
    const player = await this.hypixelService.getPlayer(tag);

    if (player) {
      return player;
    }

    return null;
  }

  public serialize(instance: Player) {
    return serialize(Player, instance);
  }

  public deserialize(data: Player) {
    return deserialize(new Player(), data);
  }
}
