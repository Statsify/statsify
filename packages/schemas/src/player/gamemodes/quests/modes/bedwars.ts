/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "#game";
import { createGameModeQuests } from "../util.js";

export const BedWarsQuests = createGameModeQuests({
	game: FormattedGame.BEDWARS,
	fieldPrefix: "bedwars",
	daily: [
		{ field: "daily_win", propertyKey: "firstWinOfTheDay" },
		{ field: "daily_one_more", propertyKey: "oneMoreGame", name: "One More Game!" },
		{ field: "daily_bed_breaker", propertyKey: "painsomnia" },
		{ field: "daily_final_killer", propertyKey: "headHunter" },
	],
	weekly: [
		{ field: "weekly_bed_elims", propertyKey: "bedRemovalCo", name: "Bed Removal Co." },
		{ field: "weekly_dream_win", propertyKey: "sleepTight", name: "Sleep Tight." },
		{ field: "weekly_challenges", propertyKey: "challenger" },
		{ field: "weekly_final_killer", propertyKey: "finishingTheJob" },
	],
});
