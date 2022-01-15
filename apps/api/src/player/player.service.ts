import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { Player } from '@statsify/schemas';
import type { ReturnModelType } from '@typegoose/typegoose';

@Injectable()
export class PlayerService {
  public constructor(
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>
  ) {}
}
