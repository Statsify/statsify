/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { modelOptions as ModelOptions } from "@typegoose/typegoose";
import { Player } from "@statsify/schemas";

// Player turns the version key off, and sessions would inherit that; they keep it so their
// documents don't change
@ModelOptions({ schemaOptions: { collection: "session", versionKey: "__v" } })
export class Session extends Player {}
