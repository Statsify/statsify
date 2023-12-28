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

export class CopsAndCrimsChallenges implements GameChallenges {
	@Field(challengeFieldData)
	public pistol: number;

	@Field(challengeFieldData)
	public knife: number;

	@Field(challengeFieldData)
	public grenade: number;

	@Field(challengeFieldData)
	public killingSpree: number;

	@Field({
		leaderboard: {
			fieldName: `${removeFormatting(FormattedGame.COPS_AND_CRIMS)} Total`,
			name: "Total",
		},
	})
	public total: number;

	public constructor(challenges: APIData) {
		this.pistol = challenges.MCGO__pistol_challenge;
		this.knife = challenges.MCGO__knife_challenge;
		this.grenade = challenges.MCGO__grenade_challenge;
		this.killingSpree = challenges.MCGO__killing_spree_challenge;

		this.total = add(this.pistol, this.knife, this.grenade, this.killingSpree);
	}
}
