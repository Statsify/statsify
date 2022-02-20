import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Friends, Player } from '@statsify/schemas';
import { HypixelModule } from '../hypixel';
import { LeaderboardModule } from '../leaderboards';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';

@Module({
  imports: [HypixelModule, LeaderboardModule, TypegooseModule.forFeature([Player, Friends])],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
