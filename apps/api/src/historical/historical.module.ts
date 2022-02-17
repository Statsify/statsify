import { PlayerModule } from '#player/player.module';
import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { HistoricalController } from './historical.controller';
import { HistoricalService } from './historical.service';
import { Daily } from './models/daily.model';
import { Monthly } from './models/monthly.model';
import { Weekly } from './models/weekly.model';

@Module({
  imports: [PlayerModule, TypegooseModule.forFeature([Daily, Weekly, Monthly])],
  controllers: [HistoricalController],
  providers: [HistoricalService],
})
export class HistoricalModule {}
