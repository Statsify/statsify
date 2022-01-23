import { HypixelModule } from '#hypixel/hypixel.module';
import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Friends, Player } from '@statsify/schemas';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';

@Module({
  imports: [HypixelModule, TypegooseModule.forFeature([Player, Friends])],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
