import { Achievements, Friends, Player } from '@statsify/schemas';
import { PlayerService } from '../../src/player';
import { MockClass } from './mock.type';

export const playerService: MockClass<PlayerService> = {
  findOne: jest.fn().mockResolvedValue(new Player()),
  findFriends: jest.fn().mockResolvedValue(new Friends({})),
  findAchievements: jest.fn().mockResolvedValue({
    uuid: '',
    displayName: '',
    goldAchievements: true,
    achievements: new Achievements({}, {}),
  }),
  deleteOne: jest.fn().mockResolvedValue(true),
};
