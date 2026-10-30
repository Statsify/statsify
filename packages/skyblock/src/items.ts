/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RARITIES, type ItemView, type ItemsResource, type Rarity, type RawItem } from "#types";
import { removeFormatting } from "@statsify/util";
import { skinHash, textureOf } from "#textures";

// Longest first, so "VERY SPECIAL" wins over "SPECIAL" and "UNCOMMON" over "COMMON". Shiny items say "SHINY MYTHIC …".
const RARITY_LINE = new RegExp(
  `^(?:a )?(?:SHINY )?(${RARITIES.map((rarity) => rarity.replace("_", " "))
    .toSorted((a, b) => b.length - a.length)
    .join("|")})\\b`
);

/** Recombobulated items wrap the last lore line in obfuscated "a"s: "§d§l§ka§r §d§lMYTHIC ACCESSORY §d§l§ka". */
function rarityOf(lore: readonly string[]): Rarity | undefined {
  const rarity = RARITY_LINE.exec(removeFormatting(lore.at(-1) ?? "").trim())?.[1];
  return rarity?.replace(" ", "_") as Rarity | undefined;
}

export function toItemView(item: RawItem): ItemView {
  const attributes = item.tag?.ExtraAttributes ?? {};
  const id = attributes.id ?? `minecraft:${item.id}:${item.Damage}`;
  const lore = item.tag?.display?.Lore ?? [];

  return {
    id,
    uuid: attributes.uuid,
    name: item.tag?.display?.Name ?? id,
    lore,
    rarity: rarityOf(lore),
    count: item.Count,
    glint: item.tag?.ench !== undefined,
    texture: textureOf(item),
    reforge: attributes.modifier,
    stars: attributes.upgrade_level ?? attributes.dungeon_item_level,
    recombobulated: Boolean(attributes.rarity_upgrades),
    enchantments: attributes.enchantments,
  };
}

interface RawResourceItem {
  id: string;
  name: string;
  material: string;
  durability?: number;
  tier?: string;
  category?: string;
  color?: string;
  skin?: { value: string };
  origin?: string;
  rift_transferrable?: boolean;
}

// The resource leaves COMMON out and still calls DIVINE by its old name. UNOBTAINABLE isn't a rarity.
const tierOf = (tier = "COMMON") => (tier === "SUPREME" ? "DIVINE" : RARITIES.find((rarity) => rarity === tier));

export function parseItemsResource(raw: { lastUpdated: number; items: RawResourceItem[] }): ItemsResource {
  return {
    lastUpdated: raw.lastUpdated,
    items: Object.fromEntries(
      raw.items.map(({ id, name, material, durability, tier, category, color, skin, origin, rift_transferrable }) => [
        id,
        {
          name,
          material,
          durability,
          tier: tierOf(tier),
          category,
          color,
          skin: skin && skinHash(skin.value),
          riftOnly: origin === "RIFT" && !rift_transferrable ? true : undefined,
        },
      ])
    ),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("rarityOf reads the last lore line", () => {
    expect(rarityOf(["§7Stuff", "§6§lLEGENDARY DUNGEON BOOTS"])).toBe("LEGENDARY");
    expect(rarityOf(["§d§l§ka§r §d§lMYTHIC ACCESSORY §d§l§ka"])).toBe("MYTHIC");
    expect(rarityOf(["§c§lVERY SPECIAL HATCESSORY"])).toBe("VERY_SPECIAL");
    expect(rarityOf(["§d§l§ka§r §d§lSHINY MYTHIC DUNGEON SWORD §d§l§ka"])).toBe("MYTHIC");
    expect(rarityOf(["§a§lUNCOMMON"])).toBe("UNCOMMON");
    expect(rarityOf(["§7A rare find"])).toBeUndefined();
    expect(rarityOf([])).toBeUndefined();
  });
}
