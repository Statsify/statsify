/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { add, ratio } from "@statsify/math";
import type { APIData } from "@statsify/util";

export class Defusal {
	@Field({ leaderboard: { additionalFields: ["this.roundWins"] } })
	public wins: number;

	@Field()
	public roundWins: number;

	@Field()
	public kills: number;

	@Field()
	public deaths: number;

	@Field()
	public kdr: number;

	@Field({ leaderboard: { enabled: false } })
	public headshotKills: number;

	@Field()
	public assists: number;

	@Field()
	public bombsPlanted: number;

	@Field()
	public bombsDefused: number;

	public constructor(data: APIData) {
		this.wins = data.game_wins;
		this.roundWins = data.round_wins;
		this.kills = data.kills;
		this.deaths = data.deaths;
		this.kdr = ratio(this.kills, this.deaths);
		this.headshotKills = data.headshot_kills;
		this.assists = data.assists;
		this.bombsPlanted = data.bombs_planted;
		this.bombsDefused = data.bombs_defused;
	}
}

export class Deathmatch {
	@Field()
	public wins: number;

	@Field()
	public kills: number;

	@Field()
	public deaths: number;

	@Field()
	public kdr: number;

	@Field()
	public assists: number;

	public constructor(data: APIData) {
		this.wins = data.game_wins_deathmatch;
		this.kills = data.kills_deathmatch;
		this.deaths = data.deaths_deathmatch;
		this.kdr = ratio(this.kills, this.deaths);
		this.assists = data.assists_deathmatch;
	}
}

export class GunGame {
	@Field()
	public wins: number;

	@Field()
	public kills: number;

	@Field()
	public deaths: number;

	@Field()
	public kdr: number;

	@Field()
	public assists: number;

	@Field({ leaderboard: { enabled: false } })
	public fastestWin: number;

	public constructor(data: APIData) {
		this.wins = data.game_wins_gungame;
		this.kills = data.kills_gungame;
		this.deaths = data.deaths_gungame;
		this.kdr = ratio(this.kills, this.deaths);
		this.assists = data.assists_gungame;
		this.fastestWin = data.fastest_win_gungame;
	}
}

export class CopsAndCrimsOverall {
	@Field()
	public wins: number;

	@Field()
	public kills: number;

	@Field()
	public deaths: number;

	@Field()
	public kdr: number;

	@Field()
	public assists: number;

	public constructor(defusal: Defusal, deathmatch: Deathmatch, gunGame: GunGame) {
		this.wins = add(defusal.wins, deathmatch.wins, gunGame.wins);
		this.kills = add(defusal.kills, deathmatch.kills, gunGame.kills);
		this.deaths = add(defusal.deaths, deathmatch.deaths, gunGame.deaths);
		this.kdr = ratio(this.kills, this.deaths);
		this.assists = add(defusal.assists, deathmatch.assists, gunGame.assists);
	}
}
