/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Friends, Player, RecentGames, Status } from '@statsify/schemas';
import { PlayerService } from '../../src/player';
import { MockClass } from './mock.type';

export const playerService: MockClass<PlayerService> = {
  get: jest.fn().mockResolvedValue(new Player()),
  getFriends: jest.fn().mockResolvedValue(new Friends({})),
  getStatus: jest.fn().mockResolvedValue(new Status({})),
  getRecentGames: jest.fn().mockResolvedValue(new RecentGames()),
  delete: jest.fn().mockResolvedValue(true),
};
