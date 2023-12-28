/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
	BlockingDead,
	BountyHunters,
	CaptureTheWool,
	CreeperAttack,
	DragonWars,
	Dropper,
	EnderSpleef,
	FarmHunt,
	Football,
	GalaxyWars,
	HideAndSeek,
	HoleInTheWall,
	HypixelSays,
	MiniWalls,
	PartyGames,
	PixelPainters,
	PixelParty,
	Seasonal,
	ThrowOut,
	Zombies,
} from "./mode.js";
import { Field } from "#metadata";
import { GameModes, type IGameModes } from "#game";
import { add } from "@statsify/math";
import type { APIData } from "@statsify/util";

export const ARCADE_MODES = new GameModes([
	{ api: "overall" },
	{ api: "blockingDead", hypixel: "DAYONE" },
	{ api: "bountyHunters", hypixel: "ONEINTHEQUIVER" },
	{ api: "captureTheWool", hypixel: "PVP_CTW" },
	{ api: "creeperAttack", hypixel: "DEFENDER" },
	{ api: "dragonWars", hypixel: "DRAGONWARS2" },
	{ api: "dropper", hypixel: "DROPPER" },
	{ api: "enderSpleef", hypixel: "ENDER" },
	{ api: "farmHunt", hypixel: "FARM_HUNT" },
	{ api: "football", hypixel: "SOCCER" },
	{ api: "galaxyWars", hypixel: "STARWARS" },
	{ api: "hideAndSeek" },
	{ api: "holeInTheWall", hypixel: "HOLE_IN_THE_WALL" },
	{ api: "hypixelSays", hypixel: "SIMON_SAYS" },
	{ api: "miniWalls", hypixel: "MINI_WALLS" },
	{ api: "partyGames", hypixel: "PARTY" },
	{ api: "pixelPainters", hypixel: "DRAW_THEIR_THING" },
	{ api: "pixelParty", hypixel: "PIXEL_PARTY" },
	{ api: "seasonal" },
	{ api: "throwOut", hypixel: "THROW_OUT" },
	{ api: "zombies" },
]);

export type ArcadeModes = IGameModes<typeof ARCADE_MODES>;

export const DROPPER_MODES = new GameModes([{ api: "overall" }, { api: "bestTimes" }, { api: "completions" }]);

export type DropperModes = IGameModes<typeof DROPPER_MODES>;

export class Arcade {
	@Field({ historical: { enabled: false } })
	public coins: number;

	@Field()
	public wins: number;

	@Field()
	public blockingDead: BlockingDead;

	@Field()
	public bountyHunters: BountyHunters;

	@Field()
	public captureTheWool: CaptureTheWool;

	@Field()
	public creeperAttack: CreeperAttack;

	@Field()
	public dragonWars: DragonWars;

	@Field()
	public dropper: Dropper;

	@Field()
	public enderSpleef: EnderSpleef;

	@Field()
	public farmHunt: FarmHunt;

	@Field()
	public football: Football;

	@Field()
	public galaxyWars: GalaxyWars;

	@Field()
	public hideAndSeek: HideAndSeek;

	@Field()
	public holeInTheWall: HoleInTheWall;

	@Field()
	public hypixelSays: HypixelSays;

	@Field()
	public miniWalls: MiniWalls;

	@Field()
	public partyGames: PartyGames;

	@Field()
	public pixelPainters: PixelPainters;

	@Field()
	public pixelParty: PixelParty;

	@Field()
	public seasonal: Seasonal;

	@Field()
	public throwOut: ThrowOut;

	@Field()
	public zombies: Zombies;

	public constructor(data: APIData, ap: APIData) {
		this.coins = data.coins;
		this.blockingDead = new BlockingDead(data);
		this.bountyHunters = new BountyHunters(data);
		this.captureTheWool = new CaptureTheWool(data);
		this.creeperAttack = new CreeperAttack(data);
		this.dragonWars = new DragonWars(data, ap);
		this.dropper = new Dropper(data?.dropper);
		this.enderSpleef = new EnderSpleef(data);
		this.farmHunt = new FarmHunt(data);
		this.football = new Football(data);
		this.galaxyWars = new GalaxyWars(data);
		this.hideAndSeek = new HideAndSeek(data, ap);
		this.holeInTheWall = new HoleInTheWall(data);
		this.hypixelSays = new HypixelSays(data);
		this.miniWalls = new MiniWalls(data);
		this.partyGames = new PartyGames(data);
		this.pixelPainters = new PixelPainters(data);
		this.pixelParty = new PixelParty(data);
		this.seasonal = new Seasonal(data);
		this.throwOut = new ThrowOut(data);
		this.zombies = new Zombies(data);

		this.wins = add(
			this.blockingDead.wins,
			this.bountyHunters.wins,
			this.captureTheWool.wins,
			this.dragonWars.wins,
			this.dropper.wins,
			this.enderSpleef.wins,
			this.farmHunt.wins,
			this.football.wins,
			this.galaxyWars.wins,
			this.hideAndSeek.overall.wins,
			this.holeInTheWall.wins,
			this.hypixelSays.wins,
			this.miniWalls.wins,
			this.partyGames.wins,
			this.pixelPainters.wins,
			this.pixelParty.overall.wins,
			this.seasonal.totalWins,
			this.throwOut.wins,
			this.zombies.overall.wins
		);
	}
}

export * from "./mode.js";
export * from "./seasonal-mode.js";
