/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const SpeedUHCQuests = createGameModeQuests({
	game: FormattedGame.SPEED_UHC,
	daily: [
		{ field: "solo_brawler", propertyKey: "soloSpeedBrawler" },
		{ field: "team_brawler", propertyKey: "teamSpeedBrawler" },
	],
	weekly: [{ field: "uhc_madness", propertyKey: "madness" }],
});
