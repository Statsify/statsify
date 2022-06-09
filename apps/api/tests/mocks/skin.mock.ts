import { SkinService } from '../../src/skin';
import { MockClass } from './mock.type';

export const skinService: MockClass<SkinService> = {
  getHead: jest.fn(),
  getRender: jest.fn(),
  getSkin: jest.fn(),
};
