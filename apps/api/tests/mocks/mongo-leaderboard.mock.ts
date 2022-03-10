import { MongoLeaderboardService } from '../../src/leaderboards';
import { MockClass } from './mock.type';

export const mongoLeaderboardService: MockClass<MongoLeaderboardService> = {
  getLeaderboard: jest.fn().mockResolvedValue([]),
  getLeaderboardRanking: jest.fn().mockResolvedValue(1),
};
