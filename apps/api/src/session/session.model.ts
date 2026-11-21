/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PlayerSchema } from "@statsify/schemas";

/** The player as it was when the session started, saved apart from the live one */
export const Session = { name: "Session", schema: PlayerSchema, collection: "session" };
