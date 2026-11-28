/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  RARITIES,
  type ItemView,
  type ItemsResource,
  type Rarity,
} from "#types";
import { getItemTexture, skinHash } from "#textures";
import { removeFormatting } from "@statsify/util";
import type { RawItem, RawItemsResource } from "#raw";

// Longest first, so "VERY SPECIAL" wins over "SPECIAL".
const RARITY_NAMES = RARITIES.map((rarity) =>
  rarity.replace("_", " "),
).toSorted((a, b) => b.length - a.length);

// Recombobulated items open the rarity line with an obfuscated "a".
const RARITY_LINE = new RegExp(
  `^(?:a )?(?:SHINY )?(${RARITY_NAMES.join("|")})\\b`,
);

function getLoreRarity(lore: string[]): Rarity | undefined {
  const rarity = RARITY_LINE.exec(
    removeFormatting(lore.at(-1) ?? "").trim(),
  )?.[1];
  return rarity?.replace(" ", "_") as Rarity | undefined;
}

// The decode leaves an NBT long as [high, low], with the low half signed.
function nbtNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(Number.isInteger)
  )
    return value[0] * 2 ** 32 + (value[1] >>> 0);
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
    rarity: getLoreRarity(lore),
    count: item.Count,
    glint: item.tag?.ench !== undefined,
    texture: getItemTexture(item),
    reforge: attributes.modifier,
    stars: nbtNumber(attributes.upgrade_level ?? attributes.dungeon_item_level),
    recombobulated: Boolean(attributes.rarity_upgrades),
    enchantments: attributes.enchantments,
  };
}

export function parseItemsResource(raw: RawItemsResource): ItemsResource {
  return {
    lastUpdated: raw.lastUpdated,
    items: Object.fromEntries(
      raw.items.map(
        ({
          id,
          name,
          material,
          durability,
          // The resource leaves COMMON out and still calls DIVINE SUPREME.
          tier = "COMMON",
          category,
          color,
          skin,
          origin,
          rift_transferrable,
          npc_sell_price,
        }) => [
          id,
          {
            name,
            material,
            durability,
            tier:
              tier === "SUPREME"
                ? "DIVINE"
                : RARITIES.find((rarity) => rarity === tier),
            category,
            color,
            skin: skin && skinHash(skin.value),
            riftOnly:
              origin === "RIFT" && !rift_transferrable ? true : undefined,
            npcPrice: npc_sell_price,
          },
        ],
      ),
    ),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getLoreRarity", () => {
    it("should read the last lore line", () => {
      expect(getLoreRarity(["§7Stuff", "§6§lLEGENDARY DUNGEON BOOTS"])).toBe(
        "LEGENDARY",
      );
      expect(getLoreRarity(["§a§lUNCOMMON"])).toBe("UNCOMMON");
      expect(getLoreRarity(["§c§lVERY SPECIAL HATCESSORY"])).toBe(
        "VERY_SPECIAL",
      );
    });

    it("should read a recombobulated or shiny line", () => {
      expect(getLoreRarity(["§d§l§ka§r §d§lMYTHIC ACCESSORY §d§l§ka"])).toBe(
        "MYTHIC",
      );
      expect(
        getLoreRarity(["§d§l§ka§r §d§lSHINY MYTHIC DUNGEON SWORD §d§l§ka"]),
      ).toBe("MYTHIC");
    });

    it("should skip lore with no rarity", () => {
      expect(getLoreRarity(["§7A rare find"])).toBeUndefined();
      expect(getLoreRarity([])).toBeUndefined();
    });
  });

  suite("nbtNumber", () => {
    it("should join a long's halves", () => {
      expect(nbtNumber([0, 7])).toBe(7);
      expect(nbtNumber([0, -1])).toBe(2 ** 32 - 1);
      expect(nbtNumber([406, -2_051_689_472])).toBe(1_746_000_000_000);
    });

    it("should keep an int and skip anything else", () => {
      expect(nbtNumber(5)).toBe(5);
      expect(nbtNumber("5")).toBeUndefined();
    });
  });
}
