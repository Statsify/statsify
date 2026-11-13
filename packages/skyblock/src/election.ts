/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { normalizeItemText } from "#lore";
import type { RawElection } from "#raw";

export interface Perk {
  name: string;
  /** With the game's § codes. */
  description: string;
}

/** The mayor and minister in office. */
export interface MayorView {
  mayor: { name: string; perks: Perk[] };
  minister?: { name: string; perk: Perk };
  term: number; // the SkyBlock year the term began, the one after its election's
}

// Perks write stats with the game's private-use glyphs, as lore does
const toPerk = ({ name, description }: Perk): Perk => ({ name, description: normalizeItemText(description) });

export const toMayorView = ({ mayor }: RawElection): MayorView => ({
  mayor: { name: mayor.name, perks: mayor.perks.map(toPerk) },
  minister: mayor.minister && { name: mayor.minister.name, perk: toPerk(mayor.minister.perk) },
  term: mayor.election.year + 1,
});
