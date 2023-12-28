/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
	ARCADE_MODES,
	ARENA_BRAWL_MODES,
	BEDWARS_MODES,
	BLITZSG_MODES,
	BRIDGE_MODES,
	BUILD_BATTLE_MODES,
	COPS_AND_CRIMS_MODES,
	DUELS_MODES,
	GENERAL_MODES,
	GameMode,
	GameModes,
	MEGAWALLS_MODES,
	MURDER_MYSTERY_MODES,
	PAINTBALL_MODES,
	PIT_MODES,
	Player,
	QUAKE_MODES,
	SKYWARS_MODES,
	SMASH_HEROES_MODES,
	SPEED_UHC_MODES,
	TNT_GAMES_MODES,
	TURBO_KART_RACERS_MODES,
	UHC_MODES,
	VAMPIREZ_MODES,
	WALLS_MODES,
	WARLORDS_MODES,
	WOOLWARS_MODES,
} from "@statsify/schemas";
import { ApiService, Command, CommandContext, EmbedBuilder, IMessage, PaginateService, PlayerArgument, SubCommand } from "@statsify/discord";
import { ArcadeProfile } from "../arcade/arcade.profile.js";
import { ArenaBrawlProfile } from "../arenabrawl/arenabrawl.profile.js";
import { BedWarsProfile } from "../bedwars/bedwars.profile.js";
import { BlitzSGProfile, filterBlitzKits } from "../blitzsg/blitzsg.profile.js";
import { BridgeProfile } from "../duels/bridge.profile.js";
import { BuildBattleProfile } from "../buildbattle/buildbattle.profile.js";
import { Container } from "typedi";
import { CopsAndCrimsProfile } from "../copsandcrims/copsandcrims.profile.js";
import { DuelsProfile } from "../duels/duels.profile.js";
import { GamesWithBackgrounds } from "#constants";
import { HistoricalGeneralProfile } from "../general/historical-general.profile.js";
import { MegaWallsProfile } from "../megawalls/megawalls.profile.js";
import { MurderMysteryProfile } from "../murdermystery/murdermystery.profile.js";
import { PaintballProfile } from "../paintball/paintball.profile.js";
import { PitProfile } from "../pit/pit.profile.js";
import { QuakeProfile } from "../quake/quake.profile.js";
import { STATUS_COLORS } from "@statsify/logger";
import { SkyWarsProfile } from "../skywars/skywars.profile.js";
import { SmashHeroesProfile } from "../smashheroes/smashheroes.profile.js";
import { SpeedUHCProfile } from "../speeduhc/speeduhc.profile.js";
import { TNTGamesProfile } from "../tntgames/tntgames.profile.js";
import { TurboKartRacersProfile } from "../turbokartracers/turbokartracers.profile.js";
import { UHCProfile } from "../uhc/uhc.profile.js";
import { VampireZProfile } from "../vampirez/vampirez.profile.js";
import { WallsProfile } from "../walls/walls.profile.js";
import { WarlordsProfile } from "../warlords/warlords.profile.js";
import { WoolWarsProfile } from "../woolwars/woolwars.profile.js";
import { getAssetPath } from "@statsify/assets";
import { readFileSync } from "node:fs";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { HistoricalType } from "@statsify/api-client";

const args = [PlayerArgument];

@Command({ description: "" })
export class HistoricalBase {
	private readonly apiService: ApiService;
	private readonly paginateService: PaginateService;

	public constructor(private readonly time: HistoricalType) {
		this.apiService = Container.get(ApiService);
		this.paginateService = Container.get(PaginateService);
	}

	@SubCommand({ description: (t) => t("commands.historical-arcade"), args })
	public arcade(context: CommandContext) {
		return this.run(context, ARCADE_MODES, (base, mode) => <ArcadeProfile {...base} mode={mode} />);
	}

	@SubCommand({
		description: (t) => t("commands.historical-arenabrawl"),
		args,
		group: "classic",
	})
	public arenabrawl(context: CommandContext) {
		return this.run(context, ARENA_BRAWL_MODES, (base, mode) => <ArenaBrawlProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-bedwars"), args })
	public bedwars(context: CommandContext) {
		return this.run(context, BEDWARS_MODES, (base, mode) => <BedWarsProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-bridge"), args })
	public bridge(context: CommandContext) {
		return this.run(context, BRIDGE_MODES, (base, mode) => <BridgeProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-blitzsg"), args })
	public blitzsg(context: CommandContext) {
		return this.run(context, BLITZSG_MODES, (base, mode) => <BlitzSGProfile {...base} mode={mode} />, filterBlitzKits);
	}

	@SubCommand({ description: (t) => t("commands.historical-buildbattle"), args })
	public buildbattle(context: CommandContext) {
		return this.run(context, BUILD_BATTLE_MODES, (base) => <BuildBattleProfile {...base} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-copsandcrims"), args })
	public copsandcrims(context: CommandContext) {
		return this.run(context, COPS_AND_CRIMS_MODES, (base, mode) => <CopsAndCrimsProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-duels"), args })
	public duels(context: CommandContext) {
		return this.run(context, DUELS_MODES, (base, mode) => <DuelsProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-general"), args })
	public general(context: CommandContext) {
		return this.run(context, GENERAL_MODES, (base) => <HistoricalGeneralProfile {...base} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-megawalls"), args })
	public megawalls(context: CommandContext) {
		return this.run(context, MEGAWALLS_MODES, (base, mode) => <MegaWallsProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-murdermystery"), args })
	public murdermystery(context: CommandContext) {
		return this.run(context, MURDER_MYSTERY_MODES, (base, mode) => <MurderMysteryProfile {...base} mode={mode} />);
	}

	@SubCommand({
		description: (t) => t("commands.historical-paintball"),
		args,
		group: "classic",
	})
	public paintball(context: CommandContext) {
		return this.run(context, PAINTBALL_MODES, (base) => <PaintballProfile {...base} />);
	}

	@SubCommand({
		description: (t) => t("commands.historical-pit"),
		args,
	})
	public pit(context: CommandContext) {
		return this.run(context, PIT_MODES, (base) => <PitProfile {...base} />);
	}

	@SubCommand({
		description: (t) => t("commands.historical-quake"),
		args,
		group: "classic",
	})
	public quake(context: CommandContext) {
		return this.run(context, QUAKE_MODES, (base, mode) => <QuakeProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-skywars"), args })
	public skywars(context: CommandContext) {
		return this.run(context, SKYWARS_MODES, (base, mode) => <SkyWarsProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-smashheroes"), args })
	public smashheroes(context: CommandContext) {
		return this.run(context, SMASH_HEROES_MODES, (base, mode) => <SmashHeroesProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-speeduhc"), args })
	public speeduhc(context: CommandContext) {
		return this.run(context, SPEED_UHC_MODES, (base, mode) => <SpeedUHCProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-tntgames"), args })
	public tntgames(context: CommandContext) {
		return this.run(context, TNT_GAMES_MODES, (base) => <TNTGamesProfile {...base} />);
	}

	@SubCommand({
		description: (t) => t("commands.historical-turbokartracers"),
		args,
		group: "classic",
	})
	public turbokartracers(context: CommandContext) {
		return this.run(context, TURBO_KART_RACERS_MODES, (base) => <TurboKartRacersProfile {...base} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-uhc"), args })
	public uhc(context: CommandContext) {
		return this.run(context, UHC_MODES, (base, mode) => <UHCProfile {...base} mode={mode} />);
	}

	@SubCommand({
		description: (t) => t("commands.historical-vampirez"),
		args,
		group: "classic",
	})
	public vampirez(context: CommandContext) {
		return this.run(context, VAMPIREZ_MODES, (base, mode) => <VampireZProfile {...base} mode={mode} />);
	}

	@SubCommand({
		description: (t) => t("commands.historical-walls"),
		args,
		group: "classic",
	})
	public walls(context: CommandContext) {
		return this.run(context, WALLS_MODES, (base) => <WallsProfile {...base} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-warlords"), args })
	public warlords(context: CommandContext) {
		return this.run(context, WARLORDS_MODES, (base, mode) => <WarlordsProfile {...base} mode={mode} />);
	}

	@SubCommand({ description: (t) => t("commands.historical-woolwars"), args })
	public woolwars(context: CommandContext) {
		return this.run(context, WOOLWARS_MODES, (base, mode) => <WoolWarsProfile {...base} mode={mode} />);
	}

	protected run<T extends GamesWithBackgrounds>(
		_context: CommandContext,
		_modes: GameModes<T>,
		_getProfile: (base: BaseProfileProps, mode: GameMode<T>) => JSX.Element,
		_filterModes?: (player: Player, modes: GameMode<T>[]) => GameMode<T>[]
	): IMessage {
		const preview = {
			name: "preview.png",
			data: readFileSync(getAssetPath("previews/session.png")),
			type: "image/png",
		};

		const embed = new EmbedBuilder()
			.color(STATUS_COLORS.info)
			.title((t) => t("historical.disabledWarning.title"))
			.description((t) => t("historical.disabledWarning.description"))
			.image(`attachment://${preview.name}`);

		return { embeds: [embed], files: [preview] };
	}
}
