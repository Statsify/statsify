/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Guild } from '@statsify/schemas';
import { GuildService } from '../../src/guild';
import { MockClass } from './mock.type';

export const guildService: MockClass<GuildService> = {
  get: jest.fn().mockResolvedValue(new Guild()),
};
