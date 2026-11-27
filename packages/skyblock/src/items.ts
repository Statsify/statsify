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
import { z } from "zod";

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

/** An NBT long, which the decode leaves as `[high, low]` (low signed), as a number; an int as it is. */
function nbtNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (Array.isArray(value) && value.length === 2 && value.every(Number.isInteger)) return value[0] * 2 ** 32 + (value[1] >>> 0);
  return undefined;
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
    stars: nbtNumber(attributes.upgrade_level ?? attributes.dungeon_item_level),
    recombobulated: Boolean(attributes.rarity_upgrades),
    enchantments: attributes.enchantments,
  };
}

const RawResourceItem = z.object({
  id: z.string(),
  name: z.string(),
  material: z.string(),
  durability: z.number().optional(),
  tier: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  skin: z.object({ value: z.string() }).optional(),
  origin: z.string().optional(),
  rift_transferrable: z.boolean().optional(),
  npc_sell_price: z.number().optional(),
});

/** /v2/resources/skyblock/items */
export const RawItemsResource = z.object({ lastUpdated: z.number(), items: z.array(RawResourceItem) });
export type RawItemsResource = z.infer<typeof RawItemsResource>;

// The resource leaves COMMON out and still calls DIVINE by its old name. UNOBTAINABLE isn't a rarity.
const tierOf = (tier = "COMMON") => (tier === "SUPREME" ? "DIVINE" : RARITIES.find((rarity) => rarity === tier));

export function parseItemsResource(raw: RawItemsResource): ItemsResource {
  return {
    lastUpdated: raw.lastUpdated,
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
    expect(rarityOf(["§d§l§ka§r §d§lMYTHIC ACCESSORY §d§l§ka"])).toBe("MYTHIC");
    expect(rarityOf(["§c§lVERY SPECIAL HATCESSORY"])).toBe("VERY_SPECIAL");
    expect(rarityOf(["§d§l§ka§r §d§lSHINY MYTHIC DUNGEON SWORD §d§l§ka"])).toBe("MYTHIC");
    expect(rarityOf(["§a§lUNCOMMON"])).toBe("UNCOMMON");
    expect(rarityOf(["§7A rare find"])).toBeUndefined();
    expect(rarityOf([])).toBeUndefined();
  });

  test("nbtNumber joins a long's halves", () => {
    expect(nbtNumber(5)).toBe(5);
    expect(nbtNumber([0, 7])).toBe(7);
    expect(nbtNumber([0, -1])).toBe(2 ** 32 - 1);
    expect(nbtNumber([406, -2_051_689_472])).toBe(1_746_000_000_000);
    expect(nbtNumber("5")).toBeUndefined();
  });
}
