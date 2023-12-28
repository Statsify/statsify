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

export class MurderMysteryChallenges implements GameChallenges {
	@Field(challengeFieldData)
	public murderSpree: number;

	@Field(challengeFieldData)
	public sherlock: number;

	@Field(challengeFieldData)
	public hero: number;

	@Field(challengeFieldData)
	public serialKiller: number;

	@Field({
		leaderboard: {
			fieldName: `${removeFormatting(FormattedGame.MURDER_MYSTERY)} Total`,
			name: "Total",
		},
	})
	public total: number;

	public constructor(challenges: APIData) {
		this.murderSpree = challenges.MURDER_MYSTERY__murder_spree;
		this.sherlock = challenges.MURDER_MYSTERY__sherlock;
		this.hero = challenges.MURDER_MYSTERY__hero;
		this.serialKiller = challenges.MURDER_MYSTERY__serial_killer;

		this.total = add(this.murderSpree, this.sherlock, this.hero, this.serialKiller);
	}
}
