import { GuildLeaderboardService } from '../../src/guild/leaderboards/guild-leaderboard.service';
import { MockClass } from './mock.type';

export const guildLeaderboardService: MockClass<GuildLeaderboardService> = {
  getLeaderboard: jest.fn().mockResolvedValue([]),
  getLeaderboardRanking: jest.fn().mockResolvedValue({ field: '', rank: 1 }),
};
