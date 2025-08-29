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
  BlitzSGKit,
  COPS_AND_CRIMS_MODES,
  DUELS_MODES,
  type GameModeWithSubModes,
  type GameModes,
  LEADERBOARD_RATIOS,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PIT_MODES,
  Player,
  PlayerStats,
  QUAKE_MODES,
  Ratio,
  SKYWARS_MODES,
  SMASH_HEROES_MODES,
  SPEED_UHC_MODES,
  UHC_MODES,
  VAMPIREZ_MODES,
  WALLS_MODES,
  WARLORDS_MODES,
  WOOLGAMES_MODES,
} from "@statsify/schemas";
import {
  ApiService,
  Command,
  CommandContext,
  Page,
  PaginateService,
  PlayerArgument,
  SubCommand,
} from "@statsify/discord";
import { Constructor, prettify } from "@statsify/util";
import {
  GamesWithBackgrounds,
  MODES_TO_API,
  MODES_TO_FORMATTED,
  mapBackground,
} from "#constants";
import { RatiosProfile, RatiosProfileProps } from "./ratios.profile.js";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

const args = [PlayerArgument];

@Command({ description: (t) => t("commands.ratios") })
export class RatiosCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  @SubCommand({ description: (t) => t("commands.ratios-arcade"), args })
  public arcade(context: CommandContext) {
    return this.run(context, ARCADE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.ratios-arenabrawl"),
    args,
    group: "classic",
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, ARENA_BRAWL_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-bedwars"), args })
  public bedwars(context: CommandContext) {
    return this.run(context, BEDWARS_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-blitzsg"), args })
  public blitzsg(context: CommandContext) {
    return this.run(context, BLITZSG_MODES, (player, modes) => {
      const { blitzsg } = player.stats;
      const [overall, ...kits] = modes;

      const filteredKits = kits
        .sort(
          (a, b) =>
            (blitzsg[b.api] as BlitzSGKit).exp - (blitzsg[a.api] as BlitzSGKit).exp
        )
        .slice(0, 24);

      return [overall, ...filteredKits];
    });
  }

  @SubCommand({ description: (t) => t("commands.ratios-copsandcrims"), args })
  public copsandcrims(context: CommandContext) {
    return this.run(context, COPS_AND_CRIMS_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-duels"), args })
  public duels(context: CommandContext) {
    return this.run(context, DUELS_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-megawalls"), args })
  public megawalls(context: CommandContext) {
    return this.run(context, MEGAWALLS_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-murdermystery"), args })
  public murdermystery(context: CommandContext) {
    return this.run(context, MURDER_MYSTERY_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.ratios-paintball"),
    args,
    group: "classic",
  })
  public paintball(context: CommandContext) {
    return this.run(context, PAINTBALL_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-pit"), args })
  public pit(context: CommandContext) {
    return this.run(context, PIT_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-quake"), args, group: "classic" })
  public quake(context: CommandContext) {
    return this.run(context, QUAKE_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-skywars"), args })
  public skywars(context: CommandContext) {
    return this.run(context, SKYWARS_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-smashheroes"), args })
  public smashheroes(context: CommandContext) {
    return this.run(context, SMASH_HEROES_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-speeduhc"), args })
  public speeduhc(context: CommandContext) {
    return this.run(context, SPEED_UHC_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-uhc"), args })
  public uhc(context: CommandContext) {
    return this.run(context, UHC_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.ratios-vampirez"),
    args,
    group: "classic",
  })
  public vampirez(context: CommandContext) {
    return this.run(context, VAMPIREZ_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-walls"), args, group: "classic" })
  public walls(context: CommandContext) {
    return this.run(context, WALLS_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-warlords"), args })
  public warlords(context: CommandContext) {
    return this.run(context, WARLORDS_MODES);
  }

  @SubCommand({ description: (t) => t("commands.ratios-woolgames"), args })
  public woolgames(context: CommandContext) {
    return this.run(context, WOOLGAMES_MODES);
  }

  private async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    modes: GameModes<T>,
    filterModes?: (player: Player, modes: GameModeWithSubModes<T>[]) => GameModeWithSubModes<T>[]
  ) {
    const user = context.getUser();
    const player = await this.apiService.getPlayer(context.option("player"), user);

    const [logo, skin, badge] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid, user),
      this.apiService.getUserBadge(player.uuid),
    ]);

    const key = MODES_TO_API.get(modes);

    if (!key) throw new Error("Add mode to MODES_TO_API");

    const ratiosPerMode = this.getRatiosPerMode(key, modes);

    const allModes = ratiosPerMode.map(([mode]) => mode);
    const displayedModes = filterModes ? filterModes(player, allModes) : allModes;

    const pages: Page[] = displayedModes.map((mode, index) => ({
      label: mode.formatted,
      generator: async (t) => {
        const background = await getBackground(...mapBackground(modes, mode.api));

        const game = player.stats[key];
        const stats = this.getModeStats(game, mode);

        const ratios = ratiosPerMode[index][1];

        const props: RatiosProfileProps = {
          player,
          skin,
          background,
          logo,
          t,
          user,
          badge,
          mode: { ...mode, submode: mode.submodes.length === 0 ? undefined : mode.submodes[0] },
          gameName: MODES_TO_FORMATTED.get(modes)!,
          ratios: ratios.map((r) => [
            stats[r[0] as keyof typeof stats],
            stats[r[1] as keyof typeof stats],
            prettify(r[0]),
            r[3],
          ]),
        };

        const canvas = render(<RatiosProfile {...props} />, getTheme(user));
        const buffer = await canvas.toBuffer("png");

        return {
          files: [{ name: "ratios.png", data: buffer, type: "image/png" }],
          attachments: [],
        };
      },
    }));

    return this.paginateService.paginate(context, pages);
  }

  private getModeStats(game: PlayerStats[keyof PlayerStats], mode: GameModeWithSubModes<any>) {
    if (mode.submodes.length !== 0) {
      let stats = game[mode.api as keyof typeof game];
      stats = stats[mode.submodes[0].api as keyof typeof game];
      return mode.submodes[0].api === "overall" ? stats || game : stats;
    }

    const stats = game[mode.api as keyof typeof game];
    return mode.api === "overall" ? stats || game : stats;
  }

  private getRatiosPerMode<T extends GamesWithBackgrounds>(
    key: keyof PlayerStats,
    modes: GameModes<T>
  ) {
    const gameClass = Reflect.getMetadata("design:type", PlayerStats.prototype, key);

    const ratioModes: [mode: GameModeWithSubModes<T>, ratios: Ratio[]][] = [];
    const gameModes = modes.getModes();

    for (const mode of gameModes) {
      if (!mode.api) continue;

      const modeClass = this.getModeClass(mode, gameClass);
      if (!modeClass) continue;

      const ratios = LEADERBOARD_RATIOS.filter(([numerator, denominator]) => {
        const numeratorType = Reflect.getMetadata(
          "design:type",
          modeClass.prototype,
          numerator
        );

        const denominatorType = Reflect.getMetadata(
          "design:type",
          modeClass.prototype,
          denominator
        );

        return numeratorType === Number && denominatorType === Number;
      });

      if (!ratios.length) continue;

      ratioModes.push([mode, ratios]);
    }

    return ratioModes;
  }

  private getModeClass<T extends GamesWithBackgrounds>(mode: GameModeWithSubModes<T>, gameClass: Constructor<any>) {
    const apiType = Reflect.getMetadata("design:type", gameClass.prototype, mode.api);
    const modeType = mode.api === "overall" ? apiType || gameClass : apiType;

    if (mode.submodes.length === 0) return modeType;

    const submode = mode.submodes[0].api;
    const submodeType = Reflect.getMetadata("design:type", modeType.prototype, submode);
    return submode === "overall" ? submodeType || modeType : submodeType;
  }
}
