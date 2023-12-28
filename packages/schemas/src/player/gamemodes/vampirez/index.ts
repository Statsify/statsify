/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { GameModes, type IGameModes } from "#game";
import { VampireZHuman, VampireZVampire } from "./life.js";
import { add } from "@statsify/math";
import type { APIData } from "@statsify/util";

export const VAMPIREZ_MODES = new GameModes([{ api: "human" }, { api: "vampire" }]);
export type VampireZModes = IGameModes<typeof VAMPIREZ_MODES>;

export class VampireZ {
	@Field({ historical: { enabled: false } })
	public coins: number;

	@Field({ historical: { enabled: false } })
	public tokens: number;

	@Field()
	public overallWins: number;

	@Field({ historical: { enabled: false } })
	public mostVampireKills: number;

	@Field()
	public zombieKills: number;

	@Field({
		leaderboard: {
			extraDisplay: "stats.vampirez.human.naturalPrefix",
			fieldName: "Human -",
		},
	})
	public human: VampireZHuman;

	@Field({
		leaderboard: {
			extraDisplay: "stats.vampirez.vampire.naturalPrefix",
			fieldName: "Vampire -",
		},
	})
	public vampire: VampireZVampire;

	public constructor(data: APIData, legacy: APIData) {
		this.coins = data.coins;
		this.tokens = legacy.vampirez_tokens;

		this.mostVampireKills = data.most_vampire_kills_new;
		this.zombieKills = data.zombie_kills;

		this.human = new VampireZHuman(data, "human");
		this.vampire = new VampireZVampire(data, "vampire");

		this.overallWins = add(this.human.wins, this.vampire.wins);
	}
}

export * from "./life.js";
