/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const VampireZQuests = createGameModeQuests({
	game: FormattedGame.VAMPIREZ,
	fieldPrefix: "vampirez",
	daily: [
		{ field: "daily_play", propertyKey: "vampirez", fieldName: "VampireZ" },
		{ field: "daily_kill", propertyKey: "bloodDrinker" },
		{ field: "daily_human_kill", propertyKey: "humanKiller" },
		{ field: "daily_win", propertyKey: "dailyWin" },
	],
	weekly: [
		{ field: "weekly_win", propertyKey: "vampireWinner" },
		{ field: "vampirez_weekly_kill", propertyKey: "vampireSlayer" },
		{ field: "weekly_human_kill", propertyKey: "humanSlayer" },
	],
});
