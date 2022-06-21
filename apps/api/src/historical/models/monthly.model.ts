/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { modelOptions as ModelOptions } from "@typegoose/typegoose";
import { Player } from "@statsify/schemas";

@ModelOptions({ schemaOptions: { collection: "monthly" } })
export class Monthly extends Player {}
