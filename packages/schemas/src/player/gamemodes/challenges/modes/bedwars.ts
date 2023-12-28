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

export class BedWarsChallenges implements GameChallenges {
	@Field(challengeFieldData)
	public defensive: number;

	@Field(challengeFieldData)
	public support: number;

	@Field(challengeFieldData)
	public offensive: number;

	@Field({
		leaderboard: {
			fieldName: `${removeFormatting(FormattedGame.BEDWARS)} Total`,
			name: "Total",
		},
	})
	public total: number;

	public constructor(challenges: APIData) {
		this.defensive = challenges.BEDWARS__defensive;
		this.support = challenges.BEDWARS__support;
		this.offensive = challenges.BEDWARS__offensive;

		this.total = add(this.defensive, this.support, this.offensive);
	}
}
