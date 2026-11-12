/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { normalizeItemText } from "#lore";
import type { RawBingoResource, RawPlayerBingo } from "#raw";

export interface BingoGoal {
  id: string;
  name: string;
  /** With the game's § codes. */
  lore: string;
  /** A community goal's tier the network has reached, of how many; a personal goal has none. */
  community?: { tier: number; tiers: number };
  completed: boolean;
}

/** This month's Bingo card, with a player's part. */
export interface BingoView {
  name: string;
  start: number;
  end: number;
  goals: BingoGoal[];
  /** null when the player never played Bingo. Points and goals are this event's. */
  player: { points: number; completed: number; events: number } | null;
}

export function toBingoView({ id, name, start, end, goals }: RawBingoResource, player: RawPlayerBingo | null): BingoView {
  const event = player?.events.find(({ key }) => key === id);
  const completed = new Set(event?.completed_goals);

  return {
    name,
    start,
    end,
    goals: goals.map(({ id, name, lore, tiers, progress = 0 }) => ({
      id,
      name,
      lore: normalizeItemText(lore),
      community: tiers && { tier: tiers.filter((amount) => progress >= amount).length, tiers: tiers.length },
      completed: completed.has(id),
    })),
    player: player && { points: event?.points ?? 0, completed: completed.size, events: player.events.length },
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("toBingoView reads this event's goals and counts community tiers reached", () => {
    const resource: RawBingoResource = {
      id: 2,
      name: "Card",
      start: 0,
      end: 1,
      goals: [
        { id: "a", name: "A", lore: "" },
        { id: "b", name: "B", lore: "", tiers: [10, 20, 30], progress: 20 },
        { id: "c", name: "C", lore: "", tiers: [10, 20] },
      ],
    };
    const player: RawPlayerBingo = {
      events: [
        { key: 1, points: 50, completed_goals: ["x", "y"] },
        { key: 2, points: 7, completed_goals: ["a"] },
      ],
    };

    const view = toBingoView(resource, player);
    expect(view.goals.map(({ completed, community }) => [completed, community])).toEqual([
      [true, undefined],
      [false, { tier: 2, tiers: 3 }],
      [false, { tier: 0, tiers: 2 }],
    ]);
    expect(view.player).toEqual({ points: 7, completed: 1, events: 2 });
    expect(toBingoView({ ...resource, id: 3 }, player).player).toEqual({ points: 0, completed: 0, events: 2 });
    expect(toBingoView(resource, null).player).toBeNull();
  });
}
