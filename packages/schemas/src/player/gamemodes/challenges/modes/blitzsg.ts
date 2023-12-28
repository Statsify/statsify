/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, removeFormatting } from "@statsify/util";
import { Field } from "#metadata";
import { FormattedGame } from "#game";
import { add } from "@statsify/math";
import { challengeFieldData } from "../util.js";
import type { GameChallenges } from "../game-challenges.js";

export class BlitzSGChallenges implements GameChallenges {
	@Field(challengeFieldData)
	public star: number;

	@Field(challengeFieldData)
	public ironMan: number;

	@Field(challengeFieldData)
	public blitz: number;

	@Field(challengeFieldData)
	public resistance: number;

	@Field({
		leaderboard: {
			fieldName: `${removeFormatting(FormattedGame.BLITZSG)} Total`,
			name: "Total",
		},
	})
	public total: number;

	public constructor(challenges: APIData) {
		this.star = challenges.SURVIVAL_GAMES__star_challenge;
		this.ironMan = challenges.SURVIVAL_GAMES__iron_man_challenge;
		this.blitz = challenges.SURVIVAL_GAMES__blitz_challenge;
		this.resistance = challenges.SURVIVAL_GAMES__resistance_challenge;

		this.total = add(this.star, this.ironMan, this.blitz, this.resistance);
	}
}
