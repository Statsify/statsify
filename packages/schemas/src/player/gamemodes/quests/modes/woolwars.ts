/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const WoolWarsQuests = createGameModeQuests({
	game: FormattedGame.WOOLWARS,
	daily: [
		{ field: "wool_wars_daily_play", propertyKey: "firstPlayOfTheDay" },
		{ field: "wool_wars_daily_wins", propertyKey: "winnerWinnerLambDinner" },
		{ field: "wool_wars_daily_kills", propertyKey: "kills" },
	],
	weekly: [
		{ field: "wool_weekly_play", propertyKey: "kingOfTheHerd" },
		{ field: "wool_wars_weekly_shears", propertyKey: "woolConnoisseur" },
	],
});
