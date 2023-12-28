/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const SmashHeroesQuests = createGameModeQuests({
	game: FormattedGame.SMASH_HEROES,
	fieldPrefix: "supersmash",
	daily: [
		{ field: "solo_win", propertyKey: "soloWin" },
		{ field: "solo_kills", propertyKey: "soloKills" },
		{ field: "team_win", propertyKey: "teamWin" },
		{ field: "team_kills", propertyKey: "teamKills" },
	],
	weekly: [{ field: "weekly_kills", propertyKey: "weeklyKills" }],
});
