/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RARITIES, type ItemView, type ItemsResource, type Rarity, type RawItem } from "#types";
import { normalizeItemText } from "./lore.js";
import { removeFormatting } from "@statsify/util";
import { skinHash, textureOf } from "#textures";

const RARITY_NAMES = new Map<string, Rarity>([
  ...RARITIES.map((rarity) => [rarity.replace("_", " "), rarity] as const),
  // How Jerry's cosmetics name Legendary (the wiki's Rarity page)
  ["LEGENJERRY", "LEGENDARY"],
]);

const RARITY_LINE = new RegExp(`^(?:SHINY )?(${[...RARITY_NAMES.keys()].join("|")})\\b`);

function rarityOf(lore: readonly string[]): Rarity | undefined {
  const name = RARITY_LINE.exec(removeFormatting(lore.at(-1) ?? "").trim())?.[1];
  return name === undefined ? undefined : RARITY_NAMES.get(name);
}

export function toItemView(item: RawItem): ItemView {
  const attributes = item.tag?.ExtraAttributes ?? {};
  const id = attributes.id ?? `minecraft:${item.id}:${item.Damage}`;
  const lore = (item.tag?.display?.Lore ?? []).map(normalizeItemText);

  return {
    id,
    uuid: attributes.uuid,
    name: normalizeItemText(item.tag?.display?.Name ?? id),
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
  npc_sell_price?: number;
}

// The resource leaves COMMON out and still calls DIVINE by its old name. UNOBTAINABLE isn't a rarity.
const tierOf = (tier = "COMMON") => (tier === "SUPREME" ? "DIVINE" : RARITIES.find((rarity) => rarity === tier));

export function parseItemsResource(raw: { lastUpdated: number; items: RawResourceItem[] }): ItemsResource {
  return {
    lastUpdated: raw.lastUpdated,
    raw: raw.items,
    items: Object.fromEntries(
      raw.items.map(({ id, name, material, durability, tier, category, color, skin, origin, rift_transferrable, npc_sell_price }) => [
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
          npcPrice: npc_sell_price,
        },
      ])
    ),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("rarityOf reads the last lore line", () => {
    expect(rarityOf(["§7Stuff", "§6§lLEGENDARY DUNGEON BOOTS"])).toBe("LEGENDARY");
    expect(rarityOf(["§d§l§r §d§lMYTHIC ACCESSORY §r§d§l"])).toBe("MYTHIC");
    expect(rarityOf(["§c§lVERY SPECIAL HATCESSORY"])).toBe("VERY_SPECIAL");
    expect(rarityOf(["§d§l§r §d§lSHINY MYTHIC DUNGEON SWORD §r§d§l"])).toBe("MYTHIC");
    expect(rarityOf(["§a§lUNCOMMON"])).toBe("UNCOMMON");
    expect(rarityOf(["§7A rare find"])).toBeUndefined();
    expect(rarityOf([])).toBeUndefined();
  });
}
