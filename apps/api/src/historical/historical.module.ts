import { PlayerModule } from '#player/player.module';
import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Player } from '@statsify/schemas';
import { HistoricalService } from './historical.service';

@Module({
  imports: [PlayerModule, TypegooseModule.forFeature([Player])],
  providers: [HistoricalService],
})
export class HistoricalModule {}
