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

export class ArenaBrawlChallenges implements GameChallenges {
	@Field({
		...challengeFieldData,
		leaderboard: { ...challengeFieldData.leaderboard, name: "WHERE IS IT" },
	})
	public whereIsIt: number;

	@Field(challengeFieldData)
	public tripleKill: number;

	@Field(challengeFieldData)
	public noUltimate: number;

	@Field(challengeFieldData)
	public cooperation: number;

	@Field({
		leaderboard: {
			fieldName: `${removeFormatting(FormattedGame.ARENA_BRAWL)} Total`,
			name: "Total",
		},
	})
	public total: number;

	public constructor(challenges: APIData) {
		this.whereIsIt = challenges.ARENA__where_is_it_challenge;
		this.tripleKill = challenges.ARENA__triple_kill_challenge;
		this.noUltimate = challenges.ARENA__no_ultimate_challenge;
		this.cooperation = challenges.ARENA__no_ultimate_challenge;

		this.total = add(this.whereIsIt, this.tripleKill, this.noUltimate, this.cooperation);
	}
}
