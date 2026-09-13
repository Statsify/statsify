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
  type LocalizeFunction,
  Page,
  paginate,
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

type RatioMode<T extends GamesWithBackgrounds> = {
  mode: GameModeWithSubModes<T>;
  formatted: string;
  submode?: GameModeWithSubModes<T>["submodes"][number];
};

@Command({ description: (t) => t("commands.ratios") })
export class RatiosCommand {
  public constructor(private readonly apiService: ApiService) {}

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
            (blitzsg[b.mode.api] as BlitzSGKit).exp - (blitzsg[a.mode.api] as BlitzSGKit).exp
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
    filterModes?: (player: Player, modes: RatioMode<T>[]) => RatioMode<T>[]
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

    const allModes = ratiosPerMode.map(({ ratioMode }) => ratioMode);
    const displayedModes = filterModes ? filterModes(player, allModes) : allModes;
    const displayedModeOrder = new Map(
      displayedModes.map((mode, index) => [this.getRatioModeKey(mode), index])
    );
    const displayedRatiosPerMode = ratiosPerMode
      .flatMap((ratio) => {
        const index = displayedModeOrder.get(this.getRatioModeKey(ratio.ratioMode));
        return index === undefined ? [] : [{ ...ratio, index }];
      })
      .sort((a, b) => a.index - b.index);

    const getGenerator = (ratioMode: RatioMode<T>, ratios: Ratio[]) => async (t: LocalizeFunction) => {
      const background = await getBackground(...mapBackground(modes, ratioMode.mode.api));

      const game = player.stats[key];
      const stats = this.getModeStats(game, ratioMode);

      const props: RatiosProfileProps = {
        player,
        skin,
        background,
        logo,
        t,
        user,
        badge,
        mode: {
          ...ratioMode.mode,
          formatted: ratioMode.formatted,
          submode: ratioMode.submode,
        },
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
    };

    const pages: Page[] = this.groupRatioModes(displayedRatiosPerMode).map((group) => {
      if (group.length === 1) {
        const [{ ratioMode, ratios }] = group;

        return {
          label: ratioMode.formatted,
          generator: getGenerator(ratioMode, ratios),
        };
      }

      return {
        label: group[0].ratioMode.mode.formatted,
        subPages: group.map(({ ratioMode, ratios }) => ({
          label: this.getSubPageLabel(ratioMode),
          generator: getGenerator(ratioMode, ratios),
        })),
      };
    });

    return paginate(context, pages);
  }

  private getModeStats(game: PlayerStats[keyof PlayerStats], ratioMode: RatioMode<any>) {
    const { mode, submode } = ratioMode;

    let stats: any;

    if (submode) {
      const modeStats = game[mode.api as keyof typeof game];
      const submodeStats = modeStats?.[submode.api as keyof typeof modeStats];
      stats = submode.api === "overall" ? submodeStats || modeStats : submodeStats;
    } else {
      const modeStats = game[mode.api as keyof typeof game];
      stats = mode.api === "overall" ? modeStats || game : modeStats;
    }

    // Some modes (e.g. Duels Classic, OP, SkyWars) only display a single
    // image and don't expose their ratio fields directly, instead nesting
    // them under an `overall` field combining their submodes
    if (stats && this.getRatios(stats.constructor).length === 0 && stats.overall)
      return stats.overall;

    return stats;
  }

  private getRatios(modeClass?: Constructor<any>): Ratio[] {
    if (!modeClass) return [];

    return LEADERBOARD_RATIOS.filter(([numerator, denominator]) => {
      const numeratorType = Reflect.getMetadata("design:type", modeClass.prototype, numerator);
      const denominatorType = Reflect.getMetadata("design:type", modeClass.prototype, denominator);

      return numeratorType === Number && denominatorType === Number;
    });
  }

  private getRatiosPerMode<T extends GamesWithBackgrounds>(
    key: keyof PlayerStats,
    modes: GameModes<T>
  ) {
    const gameClass = Reflect.getMetadata("design:type", PlayerStats.prototype, key);

    const ratioModes: { ratioMode: RatioMode<T>; ratios: Ratio[] }[] = [];
    const gameModes = modes.getModes();

    for (const mode of gameModes) {
      if (!mode.api) continue;

      for (const ratioMode of this.getRatioModes(mode)) {
        const modeClass = this.getModeClass(ratioMode, gameClass);
        if (!modeClass) continue;

        const ratios = this.getRatios(modeClass);
        if (ratios.length === 0) continue;

        ratioModes.push({ ratioMode, ratios });
      }
    }

    return ratioModes;
  }

  private getModeClass<T extends GamesWithBackgrounds>(ratioMode: RatioMode<T>, gameClass: Constructor<any>) {
    const { mode, submode } = ratioMode;
    const apiType = Reflect.getMetadata("design:type", gameClass.prototype, mode.api);
    const modeType = mode.api === "overall" ? apiType || gameClass : apiType;

    const resolved = (() => {
      if (!submode) return modeType;
      if (!modeType) return undefined;

      const submodeType = Reflect.getMetadata("design:type", modeType.prototype, submode.api);
      return submode.api === "overall" ? submodeType || modeType : submodeType;
    })();

    if (!resolved) return resolved;

    // Some modes (e.g. Duels Classic, OP, SkyWars) don't expose their ratio
    // fields directly, instead nesting them under an `overall` field
    // combining their submodes
    if (this.getRatios(resolved).length === 0) {
      const overallType = Reflect.getMetadata("design:type", resolved.prototype, "overall");
      return overallType ?? resolved;
    }

    return resolved;
  }

  private getRatioModes<T extends GamesWithBackgrounds>(mode: GameModeWithSubModes<T>): RatioMode<T>[] {
    const baseMode = {
      mode,
      formatted: mode.formatted,
    };

    if (mode.submodes.length === 0) return [baseMode];

    const submodes = mode.submodes
      .filter((submode) => submode.api !== "stats" && submode.api !== "titles")
      .map((submode) => ({
        mode,
        submode,
        formatted: this.formatSubmode(mode.formatted, submode),
      }));

    return mode.api === "overall" ? [baseMode, ...submodes] : submodes;
  }

  private formatSubmode(mode: string, submode: { api: string; formatted: string }) {
    if (submode.api === "overall") return `${mode} Overall`;
    if (submode.formatted.startsWith(mode)) return submode.formatted;
    return `${mode} ${submode.formatted}`;
  }

  private getRatioModeKey<T extends GamesWithBackgrounds>(ratioMode: RatioMode<T>) {
    return `${ratioMode.mode.api}:${ratioMode.submode?.api ?? ""}`;
  }

  private groupRatioModes<T extends GamesWithBackgrounds>(
    ratiosPerMode: { ratioMode: RatioMode<T>; ratios: Ratio[] }[]
  ) {
    const groups = new Map<string, { ratioMode: RatioMode<T>; ratios: Ratio[] }[]>();

    for (const ratio of ratiosPerMode) {
      const group = groups.get(ratio.ratioMode.mode.api) ?? [];
      group.push(ratio);
      groups.set(ratio.ratioMode.mode.api, group);
    }

    return [...groups.values()];
  }

  private getSubPageLabel<T extends GamesWithBackgrounds>(ratioMode: RatioMode<T>) {
    return ratioMode.submode?.formatted ?? ratioMode.formatted;
  }
}
