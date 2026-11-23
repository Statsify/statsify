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
import { type Constructor, prettify } from "@statsify/util";

type HexDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f";

/** A Minecraft color code as the bot's cards write them: `§0` to `§f`, or `§#rrggbb` where a card draws a hex color. */
export type ColorCode = `§${HexDigit}` | `§#${string}`;

/** Something read from a stat's value and the object it is stored in (a kit's level shows its prestige). */
export type ReadValue<T> = (value: unknown, parent: Record<string, unknown>) => T;

/** What the catalog adds to a field: only what `@Field` doesn't know. */
export interface StatEntry {
  color: ColorCode | ReadValue<ColorCode>;
  /**
   * The `stats.*` locale key of the label: the bot's own word, abbreviation included (`stats.fkdr` is "FKDR"). Defaults
   * to `stats.<the field's name>`; set where the bot uses another key (`itemsCollected.diamond` is `stats.diamonds`).
   */
  label?: string;
  /** The stat's `glossary.*` key where the label's doesn't fit it (Quests' Total counts quests). Defaults to the label's. */
  glossary?: string;
  /**
   * The card's own title where it doesn't translate one: a map, challenge or disaster name, Minecraft-formatted, taken
   * from the schema where the card takes it from there. Shown in place of `label`.
   */
  name?: string;
  /** Another field's key in the same group (`slumber.tickets` of `slumber.wallet`), or a fixed cap. */
  of?: string | number;
  /** Where the field's leaderboard formatter doesn't print it as the card does (a kit's name). */
  format?: ReadValue<string>;
  /** What the card prints for a 0 that means "never set" ("N/A"). Such a 0 isn't on the leaderboard. */
  unset?: string;
  suffix?: string;
  /** Printed with only the decimals it has (`1.3`, not `1.30`). */
  trim?: boolean;
}

/** A selection the card shows by name (a kit, a trail): Hypixel's id, prettified. */
export const selection = (color: ColorCode): StatEntry => ({ color, format: (value) => prettify(String(value)) });

/** Green once done, red before. */
export const doneColor: ReadValue<ColorCode> = (value) => (Number(value) > 0 ? "§a" : "§c");

/** Stats stored with the same fields at one or more places below the game. */
export interface Shape {
  /** Api modes (`solo`), or a mode and its submode where stats are kept a level deeper (`bridge.doubles`). */
  modes: readonly string[];
  stats: Record<string, StatEntry>;
}

/** One game: its modes (the schema's registry, not a copy) and an entry for every stat it stores. */
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
  key: string;
  /** The field in the player document, `stats.bedwars.solo.wins`, which is also its leaderboard's key. */
  path: string;
  label: string;
  /** The key of the `glossary.*` entry that explains it. */
  glossary: string;
  name?: string;
  color: StatEntry["color"];
  /** The field it is shown out of (`12/25`) by path, or its fixed cap, when it has one. */
  of?: string | number;
  leaderboard: { name: string; fieldName: string; sort: "ASC" | "DESC"; hidden: boolean } | null;
  /** The entry's format, else the schema's leaderboard formatter (levels, times); plain numbers have none. */
  format?: ReadValue<string>;
  unset?: string;
  suffix?: string;
  trim?: boolean;
}

let fields: Map<string, FieldMetadata> | undefined;

export function playerFields(): Map<string, FieldMetadata> {
  fields ??= new Map(scanMetadata(Player));
  return fields;
}

export const numberFields = (prefix: string): string[] =>
  [...playerFields()]
    .filter(([path, { type }]) => path.startsWith(prefix) && type.type === Number && !type.array)
    .map(([path]) => path);

/** The classes a class's own fields hold, in its order: each game's challenges, or a period's quests. */
export const childClasses = (ctor: Constructor) =>
  Object.entries(Reflect.getMetadata(METADATA_KEY, ctor.prototype) as ClassMetadata)
    .filter(([, { type }]) => !type.primitive)
    .map(([key, { type }]) => [key, type.type] as const);

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
    glossary: entry.glossary ?? label.slice(label.lastIndexOf(".") + 1),
    name: entry.name,
    color: entry.color,
    of,
    leaderboard: leaderboard.enabled ?
      { name: leaderboard.name, fieldName: leaderboard.fieldName ?? "", sort: leaderboard.sort, hidden: leaderboard.hidden ?? false } :
      null,
    format: entry.format ?? (formatter && ((value) => formatter(value))),
    unset: entry.unset,
    suffix: entry.suffix,
    trim: entry.trim,
  };
}

export const shapeAt = (game: Game, at: string): Shape | undefined => game.shapes.find(({ modes }) => modes.includes(at));

export const shapeKeys = (game: Game, at: string): string[] => Object.keys(shapeAt(game, at)?.stats ?? {});

function requireShape(game: Game, at: string): Shape {
  const shape = shapeAt(game, at);
  if (!shape) throw new Error(`${game.key} has no ${at} stats in the catalog`);
  return shape;
}

function registryMode(modes: Game["modes"], mode: string) {
  const found = modes.getModes().find(({ api }) => api === mode);
  if (!found) throw new Error(`The registry has no ${mode} mode`);
  return found;
}

export const modeName = (game: Game, mode: string): string => registryMode(game.modes, mode).formatted;

/** A mode's submodes after Overall (Wizards' classes). */
export const classesOf = (modes: Game["modes"], mode: string): string[] =>
  registryMode(modes, mode).submodes.map(({ api }) => api).filter((submode) => submode !== "overall");

export function gameStats(game: Game): Stat[] {
  return Object.entries(game.game).map(([key, entry]) => resolve(key, `stats.${game.key}`, entry));
}

export function modeStats(game: Game, at: string): Stat[] {
  return Object.entries(requireShape(game, at).stats).map(([key, entry]) => resolve(key, `stats.${game.key}.${at}`, entry));
}

/** One stat: a game stat when `at` is empty, else the one stored at `at` below the game. */
export function statAt(game: Game, at: string, key: string): Stat {
  const entry = at === "" ? game.game[key] : shapeAt(game, at)?.stats[key];
  if (!entry) throw new Error(`The catalog has no ${game.key}${at ? `.${at}` : ""}.${key}`);
  return resolve(key, at === "" ? `stats.${game.key}` : `stats.${game.key}.${at}`, entry);
}

/**
 * A card's color for each key: a later place's stats win over an earlier one's, and a dotted key reads a level deeper
 * (`partyPooper.wins` at `hideAndSeek`). A key with no color, or a value-based one asked without its value, throws.
 */
export function cardColors(
  game: Game,
  ...at: string[]
): (key: string, value?: unknown, parent?: object) => ColorCode {
  const entries = new Map(
    [game.game, ...at.map((place) => requireShape(game, place).stats)].flatMap((stats) => Object.entries(stats))
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

/** Every path the catalog describes for a game, game stats first. */
export function catalogPaths(game: Game): string[] {
  return [
    ...gameStats(game).map(({ path }) => path),
    ...game.shapes.flatMap(({ modes }) => modes.flatMap((at) => modeStats(game, at).map(({ path }) => path))),
  ];
}
