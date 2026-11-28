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

type AttributeShard = (typeof ATTRIBUTE_SHARDS.shards)[number];

export function getAttributeLevel(
  { attribute, rarity, unconsumable }: AttributeShard,
  member: RawMember,
) {
  if (unconsumable) return 0;

  const levels = ATTRIBUTE_SHARDS.levels[rarity];
  const syphoned = member.attributes?.stacks?.[attribute] ?? 0;
  return getLevel(syphoned, levels, levels.length).level;
}

export function getAttributes(member: RawMember): AttributesSection {
  const owned = new Map(
    (member.shards?.owned ?? []).map(({ type, amount_owned }) => [
      type,
      amount_owned ?? 0,
    ]),
  );

  const attributes = ATTRIBUTE_SHARDS.shards.map((shard) => {
    const {
      id,
      name,
      attributeName,
      rarity,
      families = [],
      unconsumable,
    } = shard;
    return {
      id,
      name,
      attribute: attributeName,
      rarity,
      families,
      level: getAttributeLevel(shard, member),
      maxLevel: unconsumable ? 0 : ATTRIBUTE_SHARDS.levels[rarity].length,
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
