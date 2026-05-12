/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import {
  AbstractArgument,
  ApiService,
  Command,
  CommandContext,
  EmbedBuilder,
  ErrorMessage,
  type LocalizationString,
  PlayerArgument,
  SubCommand,
} from "@statsify/discord";
import {
  type Constructor,
  prettify,
  removeFormatting,
} from "@statsify/util";
import { Container } from "typedi";
import {
  LEADERBOARD_RATIOS,
  MetadataScanner,
  type Player,
  PlayerStats,
  type Ratio,
} from "@statsify/schemas";
import { STATUS_COLORS } from "@statsify/logger";

type GameKey = keyof PlayerStats;

interface TargetStat {
  denominator?: string;
  denominatorName?: string;
  key: string;
  name: string;
  numerator?: string;
  numeratorName?: string;
  ratio?: Ratio;
  type: "ratio" | "stat";
}

const apiService = Container.get(ApiService);
const DEFAULT_SETBACK = 15;

const GAMES: [GameKey, name: string, group?: string][] = [
  ["arcade", "Arcade"],
  ["arenabrawl", "Arena Brawl", "classic"],
  ["bedwars", "BedWars"],
  ["blitzsg", "BlitzSG"],
  ["buildbattle", "Build Battle"],
  ["challenges", "Challenges"],
  ["copsandcrims", "Cops and Crims"],
  ["duels", "Duels"],
  ["general", "General"],
  ["megawalls", "MegaWalls"],
  ["murdermystery", "Murder Mystery"],
  ["paintball", "Paintball", "classic"],
  ["parkour", "Parkour"],
  ["pit", "Pit"],
  ["quake", "Quake", "classic"],
  ["quests", "Quests"],
  ["skywars", "SkyWars"],
  ["smashheroes", "Smash Heroes"],
  ["speeduhc", "Speed UHC"],
  ["tntgames", "TNT Games"],
  ["turbokartracers", "Turbo Kart Racers", "classic"],
  ["uhc", "UHC"],
  ["vampirez", "VampireZ", "classic"],
  ["walls", "Walls", "classic"],
  ["warlords", "Warlords"],
  ["woolgames", "WoolGames"],
];

const GAME_NAMES = new Map(GAMES.map(([key, name]) => [key, name]));

const getGameClass = (game: GameKey) =>
  Reflect.getMetadata("design:type", PlayerStats.prototype, game) as Constructor;

const statCache = new Map<GameKey, TargetStat[]>();

const targetArgs = (game: GameKey) => [
  new TargetStatArgument(game),
  new TargetArgument(),
  new PlayerArgument(),
  new SetbackArgument(),
];

class TargetStatArgument extends AbstractArgument {
  public autocomplete = true;
  public description: LocalizationString;
  public name = "stat";
  public required = true;
  public type = ApplicationCommandOptionType.String;
  private readonly game: GameKey;

  public constructor(game: GameKey) {
    super();
    this.description = (t) => t("arguments.target-stat");
    this.game = game;
  }

  public autocompleteHandler(
    context: CommandContext
  ): APIApplicationCommandOptionChoice[] {
    const currentValue = context.option<string>(this.name, "").toLowerCase();
    const stats = getTargetStats(this.game);

    const filtered = currentValue ?
      stats.filter((stat) =>
        [stat.key, stat.name]
          .some((value) => value.toLowerCase().includes(currentValue))
      ) :
      stats;

    return filtered
      .slice(0, 25)
      .map((stat) => ({ name: stat.name.slice(0, 100), value: stat.key }));
  }
}

class TargetArgument extends AbstractArgument {
  public description: LocalizationString;
  public min_value = 0;
  public name = "target";
  public required = true;
  public type = ApplicationCommandOptionType.Number;

  public constructor() {
    super();
    this.description = (t) => t("arguments.target");
  }
}

class SetbackArgument extends AbstractArgument {
  public description: LocalizationString;
  public min_value = 0;
  public name = "setback";
  public required = false;
  public type = ApplicationCommandOptionType.Integer;

  public constructor() {
    super();
    this.description = (t) => t("arguments.target-setback");
  }
}

@Command({ description: (t) => t("commands.target") })
export class TargetCommand {
  @SubCommand({ description: (t) => t("commands.target-arcade"), args: targetArgs("arcade") })
  public arcade(context: CommandContext) {
    return runTarget(context, "arcade");
  }

  @SubCommand({ description: (t) => t("commands.target-arenabrawl"), args: targetArgs("arenabrawl"), group: "classic" })
  public arenabrawl(context: CommandContext) {
    return runTarget(context, "arenabrawl");
  }

  @SubCommand({ description: (t) => t("commands.target-bedwars"), args: targetArgs("bedwars") })
  public bedwars(context: CommandContext) {
    return runTarget(context, "bedwars");
  }

  @SubCommand({ description: (t) => t("commands.target-blitzsg"), args: targetArgs("blitzsg") })
  public blitzsg(context: CommandContext) {
    return runTarget(context, "blitzsg");
  }

  @SubCommand({ description: (t) => t("commands.target-buildbattle"), args: targetArgs("buildbattle") })
  public buildbattle(context: CommandContext) {
    return runTarget(context, "buildbattle");
  }

  @SubCommand({ description: (t) => t("commands.target-challenges"), args: targetArgs("challenges") })
  public challenges(context: CommandContext) {
    return runTarget(context, "challenges");
  }

  @SubCommand({ description: (t) => t("commands.target-copsandcrims"), args: targetArgs("copsandcrims") })
  public copsandcrims(context: CommandContext) {
    return runTarget(context, "copsandcrims");
  }

  @SubCommand({ description: (t) => t("commands.target-duels"), args: targetArgs("duels") })
  public duels(context: CommandContext) {
    return runTarget(context, "duels");
  }

  @SubCommand({ description: (t) => t("commands.target-general"), args: targetArgs("general") })
  public general(context: CommandContext) {
    return runTarget(context, "general");
  }

  @SubCommand({ description: (t) => t("commands.target-megawalls"), args: targetArgs("megawalls") })
  public megawalls(context: CommandContext) {
    return runTarget(context, "megawalls");
  }

  @SubCommand({ description: (t) => t("commands.target-murdermystery"), args: targetArgs("murdermystery") })
  public murdermystery(context: CommandContext) {
    return runTarget(context, "murdermystery");
  }

  @SubCommand({ description: (t) => t("commands.target-paintball"), args: targetArgs("paintball"), group: "classic" })
  public paintball(context: CommandContext) {
    return runTarget(context, "paintball");
  }

  @SubCommand({ description: (t) => t("commands.target-parkour"), args: targetArgs("parkour") })
  public parkour(context: CommandContext) {
    return runTarget(context, "parkour");
  }

  @SubCommand({ description: (t) => t("commands.target-pit"), args: targetArgs("pit") })
  public pit(context: CommandContext) {
    return runTarget(context, "pit");
  }

  @SubCommand({ description: (t) => t("commands.target-quake"), args: targetArgs("quake"), group: "classic" })
  public quake(context: CommandContext) {
    return runTarget(context, "quake");
  }

  @SubCommand({ description: (t) => t("commands.target-quests"), args: targetArgs("quests") })
  public quests(context: CommandContext) {
    return runTarget(context, "quests");
  }

  @SubCommand({ description: (t) => t("commands.target-skywars"), args: targetArgs("skywars") })
  public skywars(context: CommandContext) {
    return runTarget(context, "skywars");
  }

  @SubCommand({ description: (t) => t("commands.target-smashheroes"), args: targetArgs("smashheroes") })
  public smashheroes(context: CommandContext) {
    return runTarget(context, "smashheroes");
  }

  @SubCommand({ description: (t) => t("commands.target-speeduhc"), args: targetArgs("speeduhc") })
  public speeduhc(context: CommandContext) {
    return runTarget(context, "speeduhc");
  }

  @SubCommand({ description: (t) => t("commands.target-tntgames"), args: targetArgs("tntgames") })
  public tntgames(context: CommandContext) {
    return runTarget(context, "tntgames");
  }

  @SubCommand({ description: (t) => t("commands.target-turbokartracers"), args: targetArgs("turbokartracers"), group: "classic" })
  public turbokartracers(context: CommandContext) {
    return runTarget(context, "turbokartracers");
  }

  @SubCommand({ description: (t) => t("commands.target-uhc"), args: targetArgs("uhc") })
  public uhc(context: CommandContext) {
    return runTarget(context, "uhc");
  }

  @SubCommand({ description: (t) => t("commands.target-vampirez"), args: targetArgs("vampirez"), group: "classic" })
  public vampirez(context: CommandContext) {
    return runTarget(context, "vampirez");
  }

  @SubCommand({ description: (t) => t("commands.target-walls"), args: targetArgs("walls"), group: "classic" })
  public walls(context: CommandContext) {
    return runTarget(context, "walls");
  }

  @SubCommand({ description: (t) => t("commands.target-warlords"), args: targetArgs("warlords") })
  public warlords(context: CommandContext) {
    return runTarget(context, "warlords");
  }

  @SubCommand({ description: (t) => t("commands.target-woolgames"), args: targetArgs("woolgames") })
  public woolgames(context: CommandContext) {
    return runTarget(context, "woolgames");
  }
}

@Command({ name: "calculate", description: (t) => t("commands.calculate") })
export class CalculateCommand extends TargetCommand {}

async function runTarget(context: CommandContext, game: GameKey) {
  const user = context.getUser();
  const player = await apiService.getPlayer(context.option("player"), user);
  const target = context.option<number>("target");
  const setback = context.option<number>("setback", DEFAULT_SETBACK);
  const stat = resolveTargetStat(game, context.option<string>("stat"));
  const gameStats = player.stats[game] as unknown as Record<string, unknown>;
  const level = getLevel(gameStats);

  if (stat.type === "ratio") {
    return buildRatioResponse(player, game, gameStats, stat, target, setback, level);
  }

  return buildStatResponse(player, game, gameStats, stat, target, level);
}

function buildRatioResponse(
  player: Player,
  game: GameKey,
  gameStats: Record<string, unknown>,
  stat: TargetStat,
  target: number,
  setback: number,
  level?: string
) {
  const numerator = getNumber(gameStats, stat.numerator!);
  const denominator = getNumber(gameStats, stat.denominator!);
  const current = denominator === 0 ? numerator : numerator / denominator;
  const needed = Math.max(0, Math.ceil(target * denominator - numerator));
  const neededWithSetback = Math.max(
    0,
    Math.ceil(target * (denominator + setback) - numerator)
  );
  const numeratorName = stat.numeratorName!;
  const denominatorName = singularize(stat.denominatorName!);

  const lines = [
    `Current: **${formatDecimal(current)} ${stat.name}**`,
    `Needed: **${formatInteger(needed)} ${numeratorName}** without another ${denominatorName}`,
  ];

  if (setback > 0) {
    lines.push(
      `Or: **${formatInteger(neededWithSetback)} ${numeratorName}** if you take **${formatInteger(setback)} ${stat.denominatorName}**`
    );
  }

  return {
    embeds: [
      baseEmbed(player, game, level)
        .title(`To reach ${formatDecimal(target)} ${stat.name}:`)
        .description(lines.join("\n")),
    ],
  };
}

function buildStatResponse(
  player: Player,
  game: GameKey,
  gameStats: Record<string, unknown>,
  stat: TargetStat,
  target: number,
  level?: string
) {
  const current = getNumber(gameStats, stat.key);
  const needed = Math.max(0, Math.ceil(target - current));
  const statName = statNameLower(stat.name);

  return {
    embeds: [
      baseEmbed(player, game, level)
        .title(`To reach ${formatTarget(target)} ${stat.name}:`)
        .description(
          [
            `Current: **${formatTarget(current)} ${stat.name}**`,
            `Needed: **${formatInteger(needed)} ${statName}**${needed === 0 ? " (target reached)" : ""}`,
          ].join("\n")
        ),
    ],
  };
}

function baseEmbed(player: Player, game: GameKey, level?: string) {
  const titleParts = [player.displayName];
  if (level) titleParts.push(level);

  return new EmbedBuilder()
    .author(titleParts.join(" "))
    .footer(GAME_NAMES.get(game)!)
    .color(STATUS_COLORS.info);
}

function getTargetStats(game: GameKey) {
  if (statCache.has(game)) return statCache.get(game)!;

  const metadata = MetadataScanner.scan(getGameClass(game));
  const numberFields = metadata
    .filter(([, { type }]) => type.type === Number)
    .map(([key, { leaderboard }]) => ({
      key,
      name: cleanName(leaderboard.fieldName || leaderboard.name || prettify(key)),
    }));

  const byKey = new Map(numberFields.map((field) => [field.key, field]));
  const ratioKeys = new Set(LEADERBOARD_RATIOS.map((ratio) => ratio[2]));
  const ratios: TargetStat[] = [];

  for (const [numerator, denominator, ratioKey, prettyName] of LEADERBOARD_RATIOS) {
    for (const field of numberFields) {
      if (lastPathPart(field.key) !== ratioKey) continue;

      const parent = parentPath(field.key);
      const numeratorKey = pathWithParent(parent, numerator);
      const denominatorKey = pathWithParent(parent, denominator);
      const numeratorField = byKey.get(numeratorKey);
      const denominatorField = byKey.get(denominatorKey);

      if (!numeratorField || !denominatorField) continue;

      ratios.push({
        denominator: denominatorKey,
        denominatorName: statNameLower(denominatorField.name),
        key: field.key,
        name: parent === "overall" || !parent ? prettyName : `${cleanName(parent)} ${prettyName}`,
        numerator: numeratorKey,
        numeratorName: statNameLower(numeratorField.name),
        ratio: [numerator, denominator, ratioKey, prettyName],
        type: "ratio",
      });
    }
  }

  const stats: TargetStat[] = [
    ...ratios,
    ...numberFields
      .filter((field) => !ratioKeys.has(lastPathPart(field.key)))
      .map((field) => ({ ...field, type: "stat" as const })),
  ];

  statCache.set(game, stats);
  return stats;
}

function resolveTargetStat(game: GameKey, input: string) {
  const stats = getTargetStats(game);
  const normalized = input.toLowerCase();
  const exact = stats.find((stat) => stat.key === input);
  if (exact) return exact;

  const overall = stats.find(
    (stat) =>
      stat.key.toLowerCase() === `overall.${normalized}` ||
      stat.name.toLowerCase() === normalized
  );
  if (overall) return overall;

  const fallback = stats.find(
    (stat) =>
      lastPathPart(stat.key).toLowerCase() === normalized ||
      stat.name.toLowerCase().includes(normalized)
  );

  if (!fallback) {
    throw new ErrorMessage(
      "Target stat not found",
      `I couldn't find \`${input}\` for ${GAME_NAMES.get(game)}. Use the stat autocomplete to pick a supported target.`
    );
  }

  return fallback;
}

function getLevel(gameStats: Record<string, unknown>) {
  const formatted = gameStats.levelFormatted || gameStats.naturalLevelFormatted;
  if (typeof formatted === "string") return removeFormatting(formatted);

  const level = gameStats.level;
  if (typeof level === "number") return `Level ${formatDecimal(level)}`;

  return undefined;
}

function getNumber(data: Record<string, unknown>, path: string) {
  const value = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], data);

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function cleanName(value: string) {
  return removeFormatting(value)
    .replace(/\s+/g, " ")
    .trim();
}

function statNameLower(value: string) {
  return cleanName(value).toLowerCase();
}

function singularize(value: string) {
  return value.endsWith("s") ? value.slice(0, -1) : value;
}

function formatDecimal(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatInteger(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatTarget(value: number) {
  return Number.isInteger(value) ? formatInteger(value) : formatDecimal(value);
}

function lastPathPart(path: string) {
  return path.split(".").at(-1)!;
}

function parentPath(path: string) {
  return path.split(".").slice(0, -1).join(".");
}

function pathWithParent(parent: string, key: string) {
  return parent ? `${parent}.${key}` : key;
}
