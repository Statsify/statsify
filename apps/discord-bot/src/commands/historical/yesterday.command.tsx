import { HistoricalType } from '@statsify/api-client';
import { Command } from '@statsify/discord';
import { HistoricalBase } from './historical.base';

@Command({ description: (t) => t('commands.lastDay') })
export class YesterdayCommand extends HistoricalBase {
  public constructor() {
    super(HistoricalType.LAST_DAY);
  }
}
