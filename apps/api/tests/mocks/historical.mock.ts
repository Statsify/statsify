import { Player } from '@statsify/schemas';
import { HistoricalService } from '../../src/historical';
import { MockClass } from './mock.type';

export const historicalService: MockClass<HistoricalService> = {
  resetPlayers: jest.fn(),
  getAndReset: jest.fn().mockResolvedValue(new Player()),
  reset: jest.fn().mockResolvedValue(new Player()),
  get: jest.fn().mockResolvedValue(new Player()),
};
