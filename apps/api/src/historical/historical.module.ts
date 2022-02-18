import { PlayerModule } from '#player/player.module';
import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { HistoricalController } from './historical.controller';
import { HistoricalService } from './historical.service';
import { Daily, LastDay, LastMonth, LastWeek, Monthly, Weekly } from './models';

@Module({
  imports: [
    PlayerModule,
    TypegooseModule.forFeature([Daily, Weekly, Monthly, LastDay, LastWeek, LastMonth]),
  ],
  controllers: [HistoricalController],
  providers: [HistoricalService],
})
export class HistoricalModule {}
