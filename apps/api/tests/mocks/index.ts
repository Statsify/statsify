import { InjectionToken } from '@nestjs/common';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AuthService } from '../../src/auth/auth.service';
import { GuildService } from '../../src/guild';
import { GuildLeaderboardService } from '../../src/guild/leaderboards/guild-leaderboard.service';
import { HistoricalService } from '../../src/historical';
import { HypixelService } from '../../src/hypixel';
import { LeaderboardService, MongoLeaderboardService } from '../../src/leaderboards';
import { PlayerService } from '../../src/player';
import { SkinService } from '../../src/skin';
import { authService } from './auth.mock';
import { guildLeaderboardService } from './guild-leaderboard.mock';
import { guildService } from './guild.mock';
import { historicalService } from './historical.mock';
import { hypixelService } from './hypixel.mock';
import { leaderboardService } from './leaderboard.mock';
import { mongoLeaderboardService } from './mongo-leaderboard.mock';
import { playerService } from './player.mock';
import { skinService } from './skin.mock';

const moduleMocker = new ModuleMocker(global);

export const useMocker = (token: InjectionToken) => {
  switch (token) {
    case AuthService:
      return authService;
    case GuildLeaderboardService:
      return guildLeaderboardService;
    case GuildService:
      return guildService;
    case HistoricalService:
      return historicalService;
    case HypixelService:
      return hypixelService;
    case LeaderboardService:
      return leaderboardService;
    case MongoLeaderboardService:
      return mongoLeaderboardService;
    case PlayerService:
      return playerService;
    case SkinService:
      return skinService;
  }

  if (typeof token === 'function') {
    const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
    return new Mock();
  }
};
