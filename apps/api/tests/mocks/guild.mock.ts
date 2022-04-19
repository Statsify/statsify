import { Guild } from '@statsify/schemas';
import { GuildService } from '../../src/guild';
import { MockClass } from './mock.type';

export const guildService: MockClass<GuildService> = {
  findOne: jest.fn().mockResolvedValue(new Guild()),
};
