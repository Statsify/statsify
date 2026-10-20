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

/** A Minecraft colour code, as the bot's cards write them. */
export type ColourCode = `§${"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f"}`;

/** What the catalog adds to a field: only what `@Field` doesn't know. */
export interface StatEntry {
  /** The colour the bot's card draws the stat in. */
  colour: ColourCode;
  /**
   * The `stats.*` locale key of the label: the bot's own word, abbreviation included (`stats.fkdr` is "FKDR"). Defaults
   * to `stats.<the field's name>`; set where the bot uses another key (`itemsCollected.diamond` is `stats.diamonds`).
   */
  label?: string;
  /** Another field this one is shown out of, by its key in the same group (`slumber.tickets` of `slumber.wallet`). */
  of?: string;
}

/**
 * One game: where its stats live, its modes (the schema's registry, not a copy) and an entry for every stat. The site's
 * and the bot's layouts pick from these; neither repeats a path, label, colour or leaderboard.
 */
export interface Game<M extends Mode[] = Mode[]> {
  /** The game's `PlayerStats` key: the bot's command name and the site's URL segment. */
  key: keyof PlayerStats & string;
  id: GameId;
  modes: GameModes<M>;
  /** Stats stored once for the game, by their path below it (`tokens`, `slumber.totalTickets`). */
  game: Record<string, StatEntry>;
  /** Stats every mode in `statModes` stores, by their path below the mode (`wins`, `itemsCollected.iron`). */
  mode: Record<string, StatEntry>;
  /** The api modes `mode` covers; a mode stored in another shape (BedWars challenges) is left out. */
  statModes: readonly string[];
}

/** A stat with everything the bot and the site show: the catalog's entry plus what `@Field` knows. */
export interface Stat {
  /** The entry's key: `wins`, `itemsCollected.iron`, `tokens`. */
  key: string;
  /** The field in the player document, `stats.bedwars.solo.wins`, which is also its leaderboard's key. */
  path: string;
  label: string;
  colour: ColourCode;
  /** The field it is shown out of (`12/25`), when it has one. */
  of?: string;
  /** The field's leaderboard, when it has one. */
  leaderboard: { name: string; fieldName: string; sort: "ASC" | "DESC"; hidden: boolean } | null;
  /** The schema's own formatter (levels, times), when the field has one; plain numbers have none. */
  format?: (value: unknown) => string;
}

let fields: Map<string, FieldMetadata> | undefined;

/** A field of the player document by path, from its `@Field` metadata. */
function field(path: string): FieldMetadata {
  fields ??= new Map(scanMetadata(Player));
  const metadata = fields.get(path);
  if (!metadata) throw new Error(`${path} is not a field of the player document`);
  return metadata;
}

function resolve(key: string, base: string, entry: StatEntry): Stat {
  const path = `${base}.${key}`;
  const { leaderboard } = field(path);
  const of = entry.of === undefined ? undefined : `${base}.${entry.of}`;
  if (of) field(of);

  return {
    key,
    path,
    label: entry.label ?? `stats.${key.slice(key.lastIndexOf(".") + 1)}`,
    colour: entry.colour,
    of,
    leaderboard: leaderboard.enabled ?
      { name: leaderboard.name, fieldName: leaderboard.fieldName ?? "", sort: leaderboard.sort, hidden: leaderboard.hidden ?? false } :
      null,
    format: leaderboard.formatter,
  };
}

/** The game's own stats, stored once rather than per mode. */
export function gameStats(game: Game): Stat[] {
  return Object.entries(game.game).map(([key, entry]) => resolve(key, `stats.${game.key}`, entry));
}

/** One mode's stats; throws for a mode the game's `mode` entries don't cover. */
export function modeStats(game: Game, mode: string): Stat[] {
  if (!game.statModes.includes(mode)) throw new Error(`${game.key} has no ${mode} stats in the catalog`);
  return Object.entries(game.mode).map(([key, entry]) => resolve(key, `stats.${game.key}.${mode}`, entry));
}

/** The modes the catalog has stats for, in the registry's order, with the registry's names. */
export function statModes(game: Game): { api: string; formatted: string }[] {
  return game.modes.getModes().filter((mode) => game.statModes.includes(mode.api)).map(({ api, formatted }) => ({ api, formatted }));
}
