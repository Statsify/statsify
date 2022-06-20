/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SkinService } from '../../src/skin';
import { MockClass } from './mock.type';

export const skinService: MockClass<SkinService> = {
  getHead: jest.fn(),
  getRender: jest.fn(),
  getSkin: jest.fn(),
};
