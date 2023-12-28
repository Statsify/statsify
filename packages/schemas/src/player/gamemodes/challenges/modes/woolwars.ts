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

export class WoolWarsChallenges implements GameChallenges {
	@Field(challengeFieldData)
	public flawless: number;

	@Field(challengeFieldData)
	public builder: number;

	@Field(challengeFieldData)
	public mercilessKiller: number;

	@Field({
		leaderboard: {
			fieldName: `${removeFormatting(FormattedGame.WOOLWARS)} Total`,
			name: "Total",
		},
	})
	public total: number;

	public constructor(challenges: APIData) {
		this.flawless = challenges.WOOL_GAMES__flawless_challenge;
		this.builder = challenges.WOOL_GAMES__builder_challenge;
		this.mercilessKiller = challenges.WOOL_GAMES__merciless_killer_challenge;

		this.total = add(this.flawless, this.builder, this.mercilessKiller);
	}
}
