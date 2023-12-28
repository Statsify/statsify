/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const ArenaBrawlQuests = createGameModeQuests({
	game: FormattedGame.ARENA_BRAWL,
	fieldPrefix: "arena",
	daily: [
		{ field: "daily_kills", propertyKey: "kills" },
		{ field: "daily_wins", propertyKey: "wins" },
		{
			field: "daily_play",
			propertyKey: "playArenaDaily",
			fieldName: "Play Arena",
			overall: { fieldName: "Play Arena (Daily)" },
		},
	],
	weekly: [
		{
			field: "weekly_play",
			propertyKey: "playArenaWeekly",
			fieldName: "Play Arena",
			overall: { fieldName: "Play Arena (Weekly)" },
		},
	],
});
