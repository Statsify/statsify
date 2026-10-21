/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { modelOptions as ModelOptions } from "@typegoose/typegoose";
import { Player } from "@statsify/schemas";

// Inherits Player's schema options, so sessions have no version key either
@ModelOptions({ schemaOptions: { collection: "session" } })
export class Session extends Player {}
