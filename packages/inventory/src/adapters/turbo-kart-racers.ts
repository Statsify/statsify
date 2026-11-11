/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemStack } from "../core/item-stack.js";
import dumped from "../../data/turbo-kart-racers.json" with { type: "json" };

export interface KartPart {
  /** As PartRarity names it, like AWESOME */
  rarity: string;
  /** Each attribute's level, as KartAttributeType names it, like { TOP_SPEED: 5 } */
  attributes: Record<string, number>;
  item: ItemStack;
}

// Built by scripts/import-dump.ts from the Kart Customizer's part selectors, by PartType
const PARTS = dumped as Record<string, KartPart[]>;

// In the Kart Customizer's order: engine, turbocharger, frame
const KART = ["engine_active", "booster_active", "frame_active"] as const;

const sameAttributes = (a: Record<string, number>, b: Record<string, number>) =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([type, level]) => b[type] === level);

/** A stored part, like {GingerbreadPart:{PartType:ENGINE,PartRarity:AWESOME,Attributes:[…]}}, as its selector's item */
function kartPart(stored: string) {
  const type = /PartType:(\w+)/.exec(stored)?.[1];
  const rarity = /PartRarity:(\w+)/.exec(stored)?.[1];
  const attributes = Object.fromEntries(
    stored.matchAll(/KartAttributeType:(\w+),Level:(\d+)/g).map(([, attribute, level]) => [attribute, Number(level)]),
  );

  // Starter (Basic) parts are stored without their attributes
  const matches = (part: KartPart) =>
    part.rarity === rarity && (Object.keys(attributes).length === 0 || sameAttributes(part.attributes, attributes));

  return PARTS[type ?? ""]?.find(matches)?.item;
}

/**
 * A Turbo Kart Racers kart from the GingerBread stats (engine_active, booster_active,
 * frame_active) as a row of the selectors' items: engine, turbocharger, frame. A part no
 * selector showed with the same rarity and attribute levels leaves its slot empty.
 */
export function fromTurboKartRacersKart(
  stats: Readonly<Partial<Record<(typeof KART)[number], string | null>>>,
): (ItemStack | undefined)[] {
  return KART.map((key) => {
    const stored = stats[key];
    return stored ? kartPart(stored) : undefined;
  });
}
