/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ATTRIBUTE_SHARDS } from "#data";
import { add } from "@statsify/math";
import { getLevel } from "#leveling";
import type { AttributesSection } from "#types";
import type { RawMember } from "#raw";

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
      level: unconsumable ? 0 : getLevel(stacks[attribute] ?? 0, levels, levels.length).level,
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
