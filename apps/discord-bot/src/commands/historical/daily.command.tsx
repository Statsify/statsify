import { HistoricalType } from '@statsify/api-client';
import { Command } from '@statsify/discord';
import { HistoricalBase } from './historical.base';

@Command({ description: (t) => t('commands.daily') })
export class DailyCommand extends HistoricalBase {
  public constructor() {
    super(HistoricalType.DAILY);
  }
}
