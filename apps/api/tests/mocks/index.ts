/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AuthService } from "";
import { GuildLeaderboardService } from "../../src/guild/leaderboards/guild-leaderboard.service.js";
import { GuildService } from "../../src/guild/index.js";
import { HistoricalService } from "../../src/historical/index.js";
import { HypixelService } from "../../src/hypixel/index.js";
import { LeaderboardService } from "../../src/leaderboards/index.js";
import { MockFactory } from "@nestjs/testing";
import { PlayerService } from "../../src/player/index.js";
import { SkinService } from "../../src/skin/index.js";
import { authService } from "./auth.mock.js";
import { guildLeaderboardService } from "./guild-leaderboard.mock.js";
import { guildService } from "./guild.mock.js";
import { historicalService } from "./historical.mock.js";
import { hypixelService } from "./hypixel.mock.js";
import { leaderboardService } from "./leaderboard.mock.js";
import { mongoLeaderboardService } from "./mongo-leaderboard.mock.js";
import { playerService } from "./player.mock.js";
import { skinService } from "./skin.mock.js";
import { vi } from "vitest";

vi.mock("../../src/auth/auth.service.js", () => ({
  AuthService: authService,
}));

const moduleMocker = new ModuleMocker(global);

export const useMocker: MockFactory = (token) => {
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

  if (typeof token === "function") {
    const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<
      any,
      any
    >;
    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
    return new Mock();
  }
};
