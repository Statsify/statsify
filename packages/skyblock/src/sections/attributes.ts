/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ATTRIBUTE_SHARDS } from "#data";
import { add } from "@statsify/math";
import type { AttributesSection } from "#types";
import type { RawMember } from "#raw";

/** An attribute's level from the shards syphoned into it, each level costing the next of its rarity's counts. */
export function attributeLevel(stacks: number, levels: number[]) {
  let spent = 0;
  return levels.filter((cost) => (spent += cost) <= stacks).length;
}

/** Every Hunting shard: the shards held, and the level of the attribute it levels, in NEU's order. */
export function getAttributes(member: RawMember): AttributesSection {
  const stacks = member.attributes?.stacks ?? {};
  const owned = new Map((member.shards?.owned ?? []).map(({ type, amount_owned }) => [type, amount_owned ?? 0]));

  const attributes = ATTRIBUTE_SHARDS.shards.map(({ id, name, attribute, attributeName, rarity, families = [], unconsumable }) => {
    const levels = ATTRIBUTE_SHARDS.levels[rarity];
    return {
      id,
      name,
      attribute: attributeName,
      rarity,
      families,
      level: unconsumable ? 0 : attributeLevel(stacks[attribute] ?? 0, levels),
      maxLevel: unconsumable ? 0 : levels.length,
      owned: owned.get(id) ?? 0,
    };
  });

  const leveled = attributes.filter(({ maxLevel }) => maxLevel > 0);
  return {
    attributes,
    unlocked: leveled.filter(({ level }) => level > 0).length,
    maxed: leveled.filter(({ level, maxLevel }) => level === maxLevel).length,
    total: leveled.length,
    owned: add(...attributes.map(({ owned }) => owned)),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("attributeLevel spends each level's shards in turn", () => {
    const common = [1, 3, 5, 6, 7, 8, 10, 14, 18, 24];
    expect(attributeLevel(0, common)).toBe(0);
    expect(attributeLevel(1, common)).toBe(1);
    expect(attributeLevel(3, common)).toBe(1);
    expect(attributeLevel(4, common)).toBe(2);
    expect(attributeLevel(95, common)).toBe(9);
    expect(attributeLevel(96, common)).toBe(10);
  });
}
