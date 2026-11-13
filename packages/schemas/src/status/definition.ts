/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "@statsify/util";
import { GameSchema } from "../game/definition.js";
import { PlayerStatusSchema } from "../player/status.definition.js";
import { s } from "#definition/s";

const RecentGameSchema = s.object({
  startedAt: s.number(),
  game: GameSchema,
  mode: s.string().optional(),
  map: s.string().optional(),
  endedAt: s.number().optional(),
  gameLength: s.number().optional(),
});

export type RecentGame = s.infer<typeof RecentGameSchema>;

export const StatusSchema = s.object({
  uuid: s.string().setLater(),
  displayName: s.string().setLater(),
  prefixName: s.string().setLater(),
  actions: PlayerStatusSchema.setLater(),
  online: s.boolean(),
  game: GameSchema,
  mode: s.string().optional(),
  map: s.string().optional(),
  recentGames: s.array(RecentGameSchema),
});

export type Status = s.infer<typeof StatusSchema>;

export function recentGame(data: APIData = {}): s.input<typeof RecentGameSchema> {
  return {
    startedAt: data.date,
    game: { code: data.gameType },
    mode: data.mode,
    map: data.map,
    endedAt: data.ended,
    gameLength: data.ended ? data.ended - data.date : undefined,
  };
}

export function status(data: APIData): s.input<typeof StatusSchema> {
  return {
    online: data.online,
    game: { code: data.gameType ?? "LIMBO" },
    mode: data.mode,
    map: data.map,
    recentGames: [],
  };
}
