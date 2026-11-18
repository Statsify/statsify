/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEVELING } from "#data";
import { SLAYER_BOSSES, type SlayersSection } from "#types";
import { add } from "@statsify/math";
import { getLevel, toLevelCosts } from "#leveling";
import type { RawMember } from "#raw";

export function getSlayers(member: RawMember): SlayersSection {
  const bosses = SLAYER_BOSSES.map((boss) => {
    const thresholds = LEVELING.slayer_xp[boss];
    const raw = member.slayer?.slayer_bosses?.[boss];
    const xp = raw?.xp ?? 0;
    const kills = Array.from({ length: LEVELING.slayer_to_highest_tier[boss] }, (_, i) => raw?.[`boss_kills_tier_${i}`] ?? 0);
    return [boss, { level: getLevel(xp, toLevelCosts(thresholds), thresholds.length), kills }] as const;
  });

  return {
    xp: add(...bosses.map(([, { level }]) => level.xp)),
    bosses: Object.fromEntries(bosses) as SlayersSection["bosses"],
  };
}
