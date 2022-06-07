import { LeaderboardService } from '../../src/leaderboards';
import { MockClass } from './mock.type';

export const leaderboardService: MockClass<LeaderboardService> = {
  addLeaderboards: jest.fn().mockResolvedValue([]),
  getLeaderboard: jest.fn().mockResolvedValue([]),
  getLeaderboardRanking: jest.fn().mockResolvedValue(1),
  getLeaderboardDocument: jest.fn().mockResolvedValue({}),
};
