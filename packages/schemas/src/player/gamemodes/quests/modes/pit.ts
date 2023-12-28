/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const PitQuests = createGameModeQuests({
	game: FormattedGame.PIT,
	fieldPrefix: "prototype_pit",
	daily: [
		{ field: "daily_kills", propertyKey: "hunter" },
		{ field: "daily_contract", propertyKey: "contracted" },
	],
	weekly: [{ field: "weekly_gold", propertyKey: "doubleUp" }],
});
