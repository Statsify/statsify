import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Player } from '@statsify/schemas';
import { HypixelModule } from '../hypixel/hypixel.module';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';

@Module({
  imports: [HypixelModule, TypegooseModule.forFeature([Player])],
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
