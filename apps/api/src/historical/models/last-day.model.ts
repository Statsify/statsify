/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Player } from '@statsify/schemas';
import { modelOptions as ModelOptions } from '@typegoose/typegoose';

@ModelOptions({ schemaOptions: { collection: 'lastDay' } })
export class LastDay extends Player {}
