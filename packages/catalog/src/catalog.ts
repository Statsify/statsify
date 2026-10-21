/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type FieldMetadata,
  type GameId,
  type GameModes,
  type Mode,
  Player,
  type PlayerStats,
  scanMetadata,
} from "@statsify/schemas";

type HexDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f";

/** A Minecraft colour code as the bot's cards write them: `§0` to `§f`, or `§#rrggbb` where a card draws a hex colour. */
export type ColourCode = `§${HexDigit}` | `§#${string}`;

/** Something read from a stat's value and the object it is stored in (a kit's level shows its prestige). */
export type ReadValue<T> = (value: unknown, parent: Record<string, unknown>) => T;

/** What the catalog adds to a field: only what `@Field` doesn't know. */
export interface StatEntry {
  /** The colour the bot's card draws the stat in, or how it picks one from the value. */
  colour: ColourCode | ReadValue<ColourCode>;
  /**
   * The `stats.*` locale key of the label: the bot's own word, abbreviation included (`stats.fkdr` is "FKDR"). Defaults
   * to `stats.<the field's name>`; set where the bot uses another key (`itemsCollected.diamond` is `stats.diamonds`).
   */
  label?: string;
  /**
   * The card's own title where it doesn't translate one: a map, challenge or disaster name, Minecraft-formatted, taken
   * from the schema where the card takes it from there. Shown in place of `label`.
   */
  name?: string;
  /** Another field this one is shown out of, by its key in the same group (`slumber.tickets` of `slumber.wallet`). */
  of?: string;
  /** How the card prints the value where the field's leaderboard formatter doesn't (a kit's name, a level numeral). */
  format?: ReadValue<string>;
  /** What the card prints for a 0 that means "never set", such as a best time ("N/A"). Such a 0 isn't on the leaderboard. */
  unset?: string;
  /** Printed after the number, as on the card (`ms`). */
  suffix?: string;
}

/** Stats stored with the same fields at one or more places below the game. */
export interface Shape {
  /** Where: api modes (`solo`), or a mode and its submode where stats are kept a level deeper (`bridge.doubles`). */
  modes: readonly string[];
  stats: Record<string, StatEntry>;
}

/**
 * One game: where its stats live, its modes (the schema's registry, not a copy) and an entry for every stat. The site's
 * and the bot's layouts pick from these; neither repeats a path, label, colour or leaderboard.
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
  name?: string;
  colour: StatEntry["colour"];
  /** The field it is shown out of (`12/25`), when it has one. */
  of?: string;
  /** The field's leaderboard, when it has one. */
  leaderboard: { name: string; fieldName: string; sort: "ASC" | "DESC"; hidden: boolean } | null;
  /** The entry's format, else the schema's leaderboard formatter (levels, times); plain numbers have none. */
  format?: ReadValue<string>;
  unset?: string;
  suffix?: string;
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

/** A field of the player document by path. */
function field(path: string): FieldMetadata {
  const metadata = playerFields().get(path);
  if (!metadata) throw new Error(`${path} is not a field of the player document`);
  return metadata;
}

function resolve(key: string, base: string, entry: StatEntry): Stat {
  const path = `${base}.${key}`;
  const { leaderboard } = field(path);
  const of = entry.of === undefined ? undefined : `${base}.${entry.of}`;
  if (of) field(of);
  const formatter = leaderboard.formatter as ((value: unknown) => string) | undefined;

  return {
    key,
    path,
    label: entry.label ?? `stats.${key.slice(key.lastIndexOf(".") + 1)}`,
    name: entry.name,
    colour: entry.colour,
    of,
    leaderboard: leaderboard.enabled ?
      { name: leaderboard.name, fieldName: leaderboard.fieldName ?? "", sort: leaderboard.sort, hidden: leaderboard.hidden ?? false } :
      null,
    format: entry.format ?? (formatter && ((value) => formatter(value))),
    unset: entry.unset,
    suffix: entry.suffix,
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
 * A card's colours: one for each of the game's own stats and, at each place given (a mode, or a mode and submode), the
 * stats stored there, a later place's winning over an earlier one's of the same key. A key that isn't one of those
 * names a stat a level deeper by its path: `partyPooper.wins` at `hideAndSeek` is `wins` at `hideAndSeek.partyPooper`,
 * and `disasters.powerups` at the game is `powerups` at `disasters`. A stat whose colour depends on its value (a kit's level,
 * a quest done or not) takes the value and the object it's stored in. A key the catalog has no colour for, or one whose
 * colour needs a value that isn't given, throws, so a card can't draw a stat in a colour the catalog doesn't hold.
 */
export function cardColours(
  game: Game,
  ...at: string[]
): (key: string, value?: unknown, parent?: object) => ColourCode {
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
    const colour = (entries.get(key) ?? deeper(key))?.colour;
    if (typeof colour === "function" && value !== undefined) return colour(value, parent as Record<string, unknown>);
    if (typeof colour !== "string") throw new Error(`The catalog has no single colour for ${game.key} ${key}`);
    return colour;
  };
}

/** The catalog paths of a game's stats, game stats first: everything the catalog describes. */
export function catalogPaths(game: Game): string[] {
  return [
    ...gameStats(game).map(({ path }) => path),
    ...game.shapes.flatMap(({ modes }) => modes.flatMap((at) => modeStats(game, at).map(({ path }) => path))),
  ];
}
