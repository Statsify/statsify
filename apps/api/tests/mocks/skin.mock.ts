import { SkinService } from '../../src/skin';
import { MockClass } from './mock.type';

export const skinService: MockClass<SkinService> = {
  getHead: jest.fn(),
  findOne: jest.fn(),
};
