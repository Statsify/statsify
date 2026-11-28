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
  lore?: string; // with § codes
  // The tier the whole network has reached, which only community goals have.
  community?: { tier: number; tiers: number };
  completed: boolean;
}

export interface BingoView {
  name: string;
  start: number;
  end: number;
  goals: BingoGoal[];
  // A player who never played Bingo has null.
  player: { points: number; completed: number; events: number } | null;
}

export function toBingoView(
  { id, name, start, end, goals }: RawBingoResource,
  player: RawPlayerBingo | null,
): BingoView {
  const event = player?.events.find(({ key }) => key === id);
  const completed = new Set(event?.completed_goals);

  return {
    name,
    start,
    end,
    goals: goals.map(({ id, name, lore, tiers, progress = 0 }) => ({
      id,
      name,
      lore: lore && normalizeItemText(lore),
      community: tiers && {
        tier: tiers.filter((amount) => progress >= amount).length,
        tiers: tiers.length,
      },
      completed: completed.has(id),
    })),
    player: player && {
      points: event?.points ?? 0,
      completed: completed.size,
      events: player.events.length,
    },
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

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

  suite("toBingoView", () => {
    it("should count the community tiers reached", () => {
      const view = toBingoView(resource, player);
      expect(
        view.goals.map(({ completed, community }) => [completed, community]),
      ).toEqual([
        [true, undefined],
        [false, { tier: 2, tiers: 3 }],
        [false, { tier: 0, tiers: 2 }],
      ]);
    });

    it("should read only this event's points and goals", () => {
      expect(toBingoView(resource, player).player).toEqual({
        points: 7,
        completed: 1,
        events: 2,
      });
      expect(toBingoView({ ...resource, id: 3 }, player).player).toEqual({
        points: 0,
        completed: 0,
        events: 2,
      });
    });

    it("should be null for a player who never played", () => {
      expect(toBingoView(resource, null).player).toBeNull();
    });
  });
}
