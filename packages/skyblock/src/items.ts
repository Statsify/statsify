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
  type Slots,
} from "#types";
import { decodeInventory } from "#nbt";
import { getItemTexture, resourceTexture, skinHash } from "#textures";
import { RARITY_COLORS } from "./display.js";
import { normalizeItemText } from "#lore";
import { removeFormatting } from "@statsify/util";
import type {
  RawItem,
  RawItemAttributes,
  RawItemsResource,
  RawNbt,
} from "#raw";

const RARITY_NAMES = new Map<string, Rarity>([
  ...RARITIES.map((rarity) => [rarity.replace("_", " "), rarity] as const),
  // Jerry's cosmetics call Legendary "LEGENJERRY".
  ["LEGENJERRY", "LEGENDARY"],
]);

const RARITY_LINE = new RegExp(
  `^(?:SHINY )?(${[...RARITY_NAMES.keys()].join("|")})\\b`,
);

function getLoreRarity(lore: string[]): Rarity | undefined {
  const name = RARITY_LINE.exec(
    removeFormatting(lore.at(-1) ?? "").trim(),
  )?.[1];
  return name === undefined ? undefined : RARITY_NAMES.get(name);
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

// The lifetime counters the saved players' items carry
const COUNTERS = [
  "absorb_logs_chopped",
  "blood_god_kills",
  "champion_combat_xp",
  "compact_blocks",
  "eman_kills",
  "expertise_kills",
  "farmed_cultivating",
  "hecatomb_s_runs",
  "logs_cut",
  "mined_crops",
  "raider_kills",
  "runic_kills",
  "spider_kills",
  "stats_book",
  "toxophilite_combat_xp",
  "zombie_kills",
] as const;

const DRILL_PARTS = [
  "drill_part_engine",
  "drill_part_fuel_tank",
  "drill_part_upgrade_module",
] as const;

// A slot named for one gem holds its quality, while COMBAT_0 names its gem
// in COMBAT_0_gem.
function getGems(raw: unknown): ItemView["gems"] {
  if (!raw || typeof raw !== "object") return;
  const slots = raw as Record<string, unknown>;

  const gems: NonNullable<ItemView["gems"]> = [];
  for (const [key, value] of Object.entries(slots)) {
    if (key === "unlocked_slots" || key.endsWith("_gem")) continue;

    const quality =
      typeof value === "string"
        ? value
        : (value as { quality?: unknown } | null)?.quality;
    if (typeof quality !== "string") continue;

    const slot = key.replace(/_\d+$/, "");
    const named = slots[`${key}_gem`];
    gems.push({ slot, gem: typeof named === "string" ? named : slot, quality });
  }

  return gems.length > 0 ? gems : undefined;
}

function getItemDetails(attributes: RawItemAttributes) {
  const counters: Record<string, number> = {};
  for (const key of COUNTERS) {
    const value = nbtNumber(attributes[key]);
    if (value !== undefined) counters[key] = Math.floor(value);
  }

  const drillParts = DRILL_PARTS.map((part) => attributes[part])
    .filter((id) => typeof id === "string")
    .map((id) => id.toUpperCase());
  const [rune] = Object.entries(attributes.runes ?? {});

  return {
    reforge: attributes.modifier,
    stars: nbtNumber(attributes.upgrade_level ?? attributes.dungeon_item_level),
    recombobulated: Boolean(attributes.rarity_upgrades),
    enchantments: attributes.enchantments,
    enrichment: attributes.talisman_enrichment,
    hotPotato: nbtNumber(attributes.hot_potato_count),
    obtainedAt: nbtNumber(attributes.timestamp),
    gems: getGems(attributes.gems),
    counters: Object.keys(counters).length > 0 ? counters : undefined,
    dye: attributes.dye_item,
    rune: rune && { id: rune[0], level: rune[1] },
    skin: attributes.skin,
    origin: attributes.originTag,
    drillParts: drillParts.length > 0 ? drillParts : undefined,
  };
}

export function toItemView(item: RawItem): ItemView {
  const attributes = item.tag?.ExtraAttributes ?? {};
  const id = attributes.id ?? `minecraft:${item.id}:${item.Damage}`;
  const lore = (item.tag?.display?.Lore ?? []).map(normalizeItemText);

  return {
    id,
    name: normalizeItemText(item.tag?.display?.Name ?? id),
    lore,
    rarity: getLoreRarity(lore),
    count: item.Count,
    glint: item.tag?.ench !== undefined,
    texture: getItemTexture(item),
    ...getItemDetails(attributes),
  };
}

// A toolkit's tool has no name or lore, so the items resource draws it.
export function toToolkitItemView(
  attributes: RawItemAttributes,
  items: ItemsResource,
): ItemView | null {
  const resource = attributes.id ? items.items[attributes.id] : undefined;
  const texture = resource && resourceTexture(resource);
  if (!attributes.id || !resource || !texture) return null;

  const rarity =
    resource.tier &&
    RARITIES[
      RARITIES.indexOf(resource.tier) + (attributes.rarity_upgrades ? 1 : 0)
    ];

  return {
    id: attributes.id,
    name: rarity ? `${RARITY_COLORS[rarity]}${resource.name}` : resource.name,
    lore: [],
    rarity,
    count: 1,
    glint:
      Object.keys(attributes.enchantments ?? {}).length > 0 ||
      Boolean(resource.glowing),
    texture,
    ...getItemDetails(attributes),
  };
}

export function decodeSlots(blob: RawNbt): Slots {
  return decodeInventory(blob).map((item) => item && toItemView(item));
}

export function parseItemsResource(raw: RawItemsResource): ItemsResource {
  // The museum keeps an armor set under the set's key, which its pieces name.
  const museum: Record<string, string> = {};
  for (const { id, museum_data: data } of raw.items) {
    if (!data?.category) continue;
    if (data.donation_xp !== undefined) museum[id] = data.category;
    for (const set of Object.keys(data.armor_set_donation_xp ?? {}))
      museum[set] = data.category;
  }

  return {
    lastUpdated: raw.lastUpdated,
    museum,
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
          glowing,
          generator,
          generator_tier,
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
            glowing,
            generator,
            generatorTier: generator_tier,
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
      expect(getLoreRarity(["§d§l§r §d§lMYTHIC ACCESSORY §r§d§l"])).toBe(
        "MYTHIC",
      );
      expect(
        getLoreRarity(["§d§l§r §d§lSHINY MYTHIC DUNGEON SWORD §r§d§l"]),
      ).toBe("MYTHIC");
    });

    it("should skip lore with no rarity", () => {
      expect(getLoreRarity(["§7A rare find"])).toBeUndefined();
      expect(getLoreRarity([])).toBeUndefined();
    });
  });

  suite("getGems", () => {
    it("should read a gem slot's quality and a mixed slot's gem", () => {
      expect(
        getGems({
          unlocked_slots: ["JADE_0", "COMBAT_0", "COMBAT_1"],
          RUBY_0: "FINE",
          JADE_0: { uuid: "x", quality: "PERFECT" },
          COMBAT_0: "FLAWLESS",
          COMBAT_0_gem: "SAPPHIRE",
        }),
      ).toEqual([
        { slot: "RUBY", gem: "RUBY", quality: "FINE" },
        { slot: "JADE", gem: "JADE", quality: "PERFECT" },
        { slot: "COMBAT", gem: "SAPPHIRE", quality: "FLAWLESS" },
      ]);
    });

    it("should skip unlocked slots with nothing in them", () => {
      expect(getGems({ unlocked_slots: ["RUBY_0"] })).toBeUndefined();
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
