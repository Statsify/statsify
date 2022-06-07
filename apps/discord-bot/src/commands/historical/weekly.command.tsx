import { HistoricalType } from '@statsify/api-client';
import { Command } from '@statsify/discord';
import { HistoricalBase } from './historical.base';

@Command({ description: (t) => t('commands.weekly') })
export class WeeklyCommand extends HistoricalBase {
  public constructor() {
    super(HistoricalType.WEEKLY);
  }
}
