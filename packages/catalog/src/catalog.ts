/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type ClassMetadata,
  type FieldMetadata,
  type GameId,
  type GameModes,
  METADATA_KEY,
  type Mode,
  Player,
  type PlayerStats,
  scanMetadata,
} from "@statsify/schemas";
import { prettify } from "@statsify/util";

type HexDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f";

/** A Minecraft color code as the bot's cards write them: `§0` to `§f`, or `§#rrggbb` where a card draws a hex color. */
export type ColorCode = `§${HexDigit}` | `§#${string}`;

/** Something read from a stat's value and the object it is stored in (a kit's level shows its prestige). */
export type ReadValue<T> = (value: unknown, parent: Record<string, unknown>) => T;

/** What the catalog adds to a field: only what `@Field` doesn't know. */
export interface StatEntry {
  /** The color the bot's card draws the stat in, or how it picks one from the value. */
  color: ColorCode | ReadValue<ColorCode>;
  /**
   * The `stats.*` locale key of the label: the bot's own word, abbreviation included (`stats.fkdr` is "FKDR"). Defaults
   * to `stats.<the field's name>`; set where the bot uses another key (`itemsCollected.diamond` is `stats.diamonds`).
   */
  label?: string;
  /**
   * The key of the stat's `glossary.*` entry in the locale files, where the label's own entry doesn't say what this stat
   * is: Quests' Total counts quests and Challenges' counts challenges. Defaults to the label's key (`fkdr`).
   */
  glossary?: string;
  /**
   * The card's own title where it doesn't translate one: a map, challenge or disaster name, Minecraft-formatted, taken
   * from the schema where the card takes it from there. Shown in place of `label`.
   */
  name?: string;
  /**
   * What this one is shown out of: another field, by its key in the same group (`slumber.tickets` of `slumber.wallet`),
   * or a fixed cap (Wool Games' Layers out of 100).
   */
  of?: string | number;
  /** How the card prints the value where the field's leaderboard formatter doesn't (a kit's name, a level numeral). */
  format?: ReadValue<string>;
  /** What the card prints for a 0 that means "never set", such as a best time ("N/A"). Such a 0 isn't on the leaderboard. */
  unset?: string;
  /** Printed after the number, as on the card (`ms`). */
  suffix?: string;
  /** Printed with only the decimals it has, as the card prints a number it doesn't format (`1.3`, not `1.30`). */
  trim?: boolean;
}

/** The entry for a selection the card shows by name (a kit, a trail): Hypixel's id, prettified. */
export const selection = (color: ColorCode): StatEntry => ({ color, format: (value) => prettify(String(value)) });

/** Green once done, red before: a challenge on the bot's challenges cards, a quest on its Quests card. */
export const doneColor: ReadValue<ColorCode> = (value) => (Number(value) > 0 ? "§a" : "§c");

/** Stats stored with the same fields at one or more places below the game. */
export interface Shape {
  /** Where: api modes (`solo`), or a mode and its submode where stats are kept a level deeper (`bridge.doubles`). */
  modes: readonly string[];
  stats: Record<string, StatEntry>;
}

/**
 * One game: where its stats live, its modes (the schema's registry, not a copy) and an entry for every stat. The site's
 * and the bot's layouts pick from these; neither repeats a path, label, color or leaderboard.
 */
export interface Game<M extends Mode[] = Mode[]> {
  /** The game's `PlayerStats` key: the bot's command name and the site's URL segment. */
  key: keyof PlayerStats & string;
  /** Its `GameId`, for its name and icon; Challenges and Quests aren't a game and have none. */
  id: GameId | null;
  modes: GameModes<M>;
  /** Stats stored once for the game, by their path below it (`tokens`, `slumber.totalTickets`). */
  game: Record<string, StatEntry>;
  /** The stats below the game's modes, by their path below the mode (`wins`, `itemsCollected.iron`). */
  shapes: Shape[];
}

/** A stat with everything the bot and the site show: the catalog's entry plus what `@Field` knows. */
export interface Stat {
  /** The entry's key: `wins`, `itemsCollected.iron`, `tokens`. */
  key: string;
  /** The field in the player document, `stats.bedwars.solo.wins`, which is also its leaderboard's key. */
  path: string;
  label: string;
  /** The key of the `glossary.*` entry that explains it; none for a stat shown under its card's name, a name to read. */
  glossary?: string;
  name?: string;
  color: StatEntry["color"];
  /** The field it is shown out of (`12/25`) by path, or its fixed cap, when it has one. */
  of?: string | number;
  /** The field's leaderboard, when it has one. */
  leaderboard: { hidden: boolean } | null;
  /** The entry's format, else the schema's leaderboard formatter (levels, times); plain numbers have none. */
  format?: ReadValue<string>;
  unset?: string;
  suffix?: string;
  trim?: boolean;
}

let fields: Map<string, FieldMetadata> | undefined;

/** Every field of the player document by path, from its `@Field` metadata. */
export function playerFields(): Map<string, FieldMetadata> {
  fields ??= new Map(scanMetadata(Player));
  return fields;
}

/** The paths of the player document's numbers below a prefix (`stats.bedwars.`). */
export const numberFields = (prefix: string): string[] =>
  [...playerFields()]
    .filter(([path, { type }]) => path.startsWith(prefix) && type.type === Number && !type.array)
    .map(([path]) => path);

/** The schema classes in a class's fields (each game's quests, a game's classes), by field name, in the class's order. */
export const childClasses = (parent: { prototype: object }): [string, Parameters<typeof scanMetadata>[0]][] =>
  Object.entries(Reflect.getMetadata(METADATA_KEY, parent.prototype) as ClassMetadata)
    .filter(([, { type }]) => !type.primitive && !type.array)
    .map(([key, { type }]) => [key, type.type as Parameters<typeof scanMetadata>[0]]);

/** A field of the player document by path. */
function field(path: string): FieldMetadata {
  const metadata = playerFields().get(path);
  if (!metadata) throw new Error(`${path} is not a field of the player document`);
  return metadata;
}

function resolve(key: string, base: string, entry: StatEntry): Stat {
  const path = `${base}.${key}`;
  const { leaderboard } = field(path);
  const of = typeof entry.of === "string" ? `${base}.${entry.of}` : entry.of;
  if (typeof of === "string") field(of);
  const formatter = leaderboard.formatter as ((value: unknown) => string) | undefined;
  const label = entry.label ?? `stats.${key.slice(key.lastIndexOf(".") + 1)}`;

  return {
    key,
    path,
    label,
    ...(entry.name === undefined && { glossary: entry.glossary ?? label.slice(label.lastIndexOf(".") + 1) }),
    name: entry.name,
    color: entry.color,
    of,
    leaderboard: leaderboard.enabled ? { hidden: leaderboard.hidden ?? false } : null,
    format: entry.format ?? (formatter && ((value) => formatter(value))),
    unset: entry.unset,
    suffix: entry.suffix,
    trim: entry.trim,
  };
}

/** The shape stored at a path below the game (`solo`, `bridge.doubles`), if the catalog has one. */
export const shapeAt = (game: Game, at: string): Shape | undefined => game.shapes.find(({ modes }) => modes.includes(at));

/** The keys of the stats stored at a path below the game, or none where the catalog has no shape there. */
export const shapeKeys = (game: Game, at: string): string[] => Object.keys(shapeAt(game, at)?.stats ?? {});

/** A mode's name as the game's registry formats it; throws where the registry has no such mode. */
export function modeName(game: Game, mode: string): string {
  const found = game.modes.getModes().find(({ api }) => api === mode);
  if (!found) throw new Error(`${game.key} has no ${mode} mode`);
  return found.formatted;
}

/** A mode's submodes after Overall (Wizards' classes); throws where the registry has no such mode. */
export function classesOf(modes: Game["modes"], mode: string): string[] {
  const found = modes.getModes().find(({ api }) => api === mode);
  if (!found) throw new Error(`The registry has no ${mode} mode`);
  return found.submodes.map(({ api }) => api).filter((submode) => submode !== "overall");
}

/** The game's own stats, stored once rather than per mode. */
export function gameStats(game: Game): Stat[] {
  return Object.entries(game.game).map(([key, entry]) => resolve(key, `stats.${game.key}`, entry));
}

/** The stats stored at a path below the game (`solo`, `bridge.doubles`); throws where the catalog has no shape. */
export function modeStats(game: Game, at: string): Stat[] {
  const shape = shapeAt(game, at);
  if (!shape) throw new Error(`${game.key} has no ${at} stats in the catalog`);
  return Object.entries(shape.stats).map(([key, entry]) => resolve(key, `stats.${game.key}.${at}`, entry));
}

/** One stat: a game stat when `at` is empty, else the one stored at `at` below the game. */
export function statAt(game: Game, at: string, key: string): Stat {
  const entry = at === "" ? game.game[key] : shapeAt(game, at)?.stats[key];
  if (!entry) throw new Error(`The catalog has no ${game.key}${at ? `.${at}` : ""}.${key}`);
  return resolve(key, at === "" ? `stats.${game.key}` : `stats.${game.key}.${at}`, entry);
}

/**
 * A card's colors: one for each of the game's own stats and, at each place given (a mode, or a mode and submode), the
 * stats stored there, a later place's winning over an earlier one's of the same key. A key that isn't one of those
 * names a stat a level deeper by its path: `partyPooper.wins` at `hideAndSeek` is `wins` at `hideAndSeek.partyPooper`,
 * and `disasters.powerups` at the game is `powerups` at `disasters`. A stat whose color depends on its value (a kit's level,
 * a quest done or not) takes the value and the object it's stored in. A key the catalog has no color for, or one whose
 * color needs a value that isn't given, throws, so a card can't draw a stat in a color the catalog doesn't hold.
 */
export function cardColors(
  game: Game,
  ...at: string[]
): (key: string, value?: unknown, parent?: object) => ColorCode {
  const entries = new Map(
    [
      game.game,
      ...at.map((place) => {
        const shape = shapeAt(game, place);
        if (!shape) throw new Error(`${game.key} has no ${place} stats in the catalog`);
        return shape.stats;
      }),
    ].flatMap((stats) => Object.entries(stats))
  );

  const deeper = (key: string) => {
    const dot = key.lastIndexOf(".");
    if (dot === -1) return undefined;
    const [below, stat] = [key.slice(0, dot), key.slice(dot + 1)];
    const places = [...at.map((place) => `${place}.${below}`).toReversed(), below];
    return places.map((place) => shapeAt(game, place)?.stats[stat]).find(Boolean);
  };

  return (key, value, parent = {}) => {
    const color = (entries.get(key) ?? deeper(key))?.color;
    if (typeof color === "function" && value !== undefined) return color(value, parent as Record<string, unknown>);
    if (typeof color !== "string") throw new Error(`The catalog has no single color for ${game.key} ${key}`);
    return color;
  };
}

/** Every stat of a game, its own first, then each shape's at each place that stores it: everything the catalog describes. */
export function allStats(game: Game): Stat[] {
  return [...gameStats(game), ...game.shapes.flatMap(({ modes }) => modes.flatMap((at) => modeStats(game, at)))];
}

/** The catalog paths of a game's stats, game stats first. */
export function catalogPaths(game: Game): string[] {
  return allStats(game).map(({ path }) => path);
}
