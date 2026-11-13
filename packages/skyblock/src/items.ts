/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type ItemAttributes,
  type ItemView,
  type ItemsResource,
  RARITIES,
  type Rarity,
  type RawItem,
  type Slots,
} from "#types";
import { decodeAttributes, decodeInventory } from "#nbt";
import { RARITY_COLORS } from "./display.js";
import { normalizeItemText } from "./lore.js";
import { removeFormatting } from "@statsify/util";
import { resourceTexture, skinHash, textureOf } from "#textures";
import type { RawNbt } from "#raw";

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

/** An NBT long, which the decode leaves as `[high, low]` (low signed), as a number; an int as it is. */
export function nbtNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (Array.isArray(value) && value.length === 2 && value.every(Number.isInteger)) return value[0] * 2 ** 32 + (value[1] >>> 0);
  return undefined;
}

// The API keys of the items' lifetime counters, as the saves have them, kept raw
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

const DRILL_PARTS = ["drill_part_engine", "drill_part_fuel_tank", "drill_part_upgrade_module"] as const;

const nonEmpty = <T>(list: T[]) => (list.length > 0 ? list : undefined);

/**
 * A slot keyed by its gem type holds the quality ("RUBY_0": "FINE", or an object with a uuid); a multi-type slot
 * ("COMBAT_0") names its gem beside it ("COMBAT_0_gem": "SAPPHIRE"). unlocked_slots lists the opened slots, filled or not.
 */
function gemsOf(raw: unknown): ItemView["gems"] {
  if (!raw || typeof raw !== "object") return undefined;
  const gems = raw as Record<string, unknown>;

  return nonEmpty(
    Object.entries(gems).flatMap(([key, value]) => {
      if (key === "unlocked_slots" || key.endsWith("_gem")) return [];
      const quality = typeof value === "string" ? value : (value as { quality?: unknown } | null)?.quality;
      if (typeof quality !== "string") return [];
      const slot = key.replace(/_\d+$/, "");
      const named = gems[`${key}_gem`];
      return [{ slot, gem: typeof named === "string" ? named : slot, quality }];
    })
  );
}

/** What an item's ExtraAttributes say beyond its name and lore. */
function attributeDetails(attributes: ItemAttributes) {
  const counters = COUNTERS.flatMap((key) => {
    const value = nbtNumber(attributes[key]);
    return value === undefined ? [] : [[key, Math.floor(value)] as const];
  });
  const [rune] = Object.entries(attributes.runes ?? {});

  return {
    reforge: attributes.modifier,
    stars: nbtNumber(attributes.upgrade_level ?? attributes.dungeon_item_level),
    recombobulated: Boolean(attributes.rarity_upgrades),
    enchantments: attributes.enchantments,
    enrichment: attributes.talisman_enrichment,
    hotPotato: nbtNumber(attributes.hot_potato_count),
    obtainedAt: nbtNumber(attributes.timestamp),
    gems: gemsOf(attributes.gems),
    counters: counters.length > 0 ? Object.fromEntries(counters) : undefined,
    dye: attributes.dye_item,
    rune: rune && { id: rune[0], level: rune[1] },
    skin: attributes.skin,
    origin: attributes.originTag,
    drillParts: nonEmpty(
      DRILL_PARTS.flatMap((part) => {
        const id = attributes[part];
        return typeof id === "string" ? [id.toUpperCase()] : [];
      })
    ),
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
    rarity: rarityOf(lore),
    count: item.Count,
    glint: item.tag?.ench !== undefined,
    texture: textureOf(item),
    ...attributeDetails(attributes),
  };
}

/**
 * A toolkit's tool, which has only its ExtraAttributes: named and drawn from the items resource, with no lore. null for
 * an id the resource can't draw.
 */
export function toolkitItemView(blob: RawNbt, items: ItemsResource): ItemView | null {
  const attributes = decodeAttributes(blob);
  const resource = attributes.id ? items.items[attributes.id] : undefined;
  const texture = resource && resourceTexture(resource);
  if (!attributes.id || !resource || !texture) return null;
  const rarity = resource.tier && RARITIES[RARITIES.indexOf(resource.tier) + (attributes.rarity_upgrades ? 1 : 0)];

  return {
    id: attributes.id,
    name: rarity ? `${RARITY_COLORS[rarity]}${resource.name}` : resource.name,
    lore: [],
    rarity,
    count: 1,
    glint: Object.keys(attributes.enchantments ?? {}).length > 0 || Boolean(resource.glowing),
    texture,
    ...attributeDetails(attributes),
  };
}

export const decodeSlots = (blob: RawNbt): Slots => decodeInventory(blob).map((item) => item && toItemView(item));

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
  glowing?: boolean;
  generator?: string;
  generator_tier?: number;
  museum_data?: {
    category?: string;
    donation_xp?: number;
    armor_set_donation_xp?: Record<string, number>;
    parent?: Record<string, string>; // the museum key → its upgrade
  };
}

// The resource leaves COMMON out and still calls DIVINE by its old name. UNOBTAINABLE isn't a rarity.
const tierOf = (tier = "COMMON") => (tier === "SUPREME" ? "DIVINE" : RARITIES.find((rarity) => rarity === tier));

export function parseItemsResource(raw: { lastUpdated: number; items: RawResourceItem[] }): ItemsResource {
  // The museum keeps an armor set under the set's key, which each of its pieces names
  const museum: ItemsResource["museum"] = {};
  for (const { id, museum_data: data } of raw.items) {
    if (!data?.category) continue;
    const { category, parent } = data;
    if (data.donation_xp !== undefined) museum[id] = { category, xp: data.donation_xp, upgrade: parent?.[id] };
    // A set's pieces can disagree (Sponge's equipment gives a point less and names no upgrade), so the set keeps the
    // most XP and any upgrade a piece names
    for (const [set, xp] of Object.entries(data.armor_set_donation_xp ?? {})) {
      const seen = museum[set];
      museum[set] = { category, xp: Math.max(xp, seen?.xp ?? 0), upgrade: parent?.[set] ?? seen?.upgrade };
    }
  }

  return {
    lastUpdated: raw.lastUpdated,
    raw: raw.items,
    museum,
    items: Object.fromEntries(
      raw.items.map(({ id, name, material, durability, tier, category, color, skin, origin, rift_transferrable, npc_sell_price, glowing, generator, generator_tier }) => [
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
          glowing,
          generator,
          generatorTier: generator_tier,
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

  test("gemsOf reads a typed slot's quality and a mixed slot's gem", () => {
    expect(
      gemsOf({
        unlocked_slots: ["JADE_0", "COMBAT_0", "COMBAT_1"],
        RUBY_0: "FINE",
        JADE_0: { uuid: "x", quality: "PERFECT" },
        COMBAT_0: "FLAWLESS",
        COMBAT_0_gem: "SAPPHIRE",
      })
    ).toEqual([
      { slot: "RUBY", gem: "RUBY", quality: "FINE" },
      { slot: "JADE", gem: "JADE", quality: "PERFECT" },
      { slot: "COMBAT", gem: "SAPPHIRE", quality: "FLAWLESS" },
    ]);
    expect(gemsOf({ unlocked_slots: ["RUBY_0"] })).toBeUndefined();
  });

  test("nbtNumber joins a long's halves", () => {
    expect(nbtNumber(5)).toBe(5);
    expect(nbtNumber([0, 7])).toBe(7);
    expect(nbtNumber([0, -1])).toBe(2 ** 32 - 1);
    expect(nbtNumber([406, -2_051_689_472])).toBe(1_746_000_000_000);
    expect(nbtNumber("5")).toBeUndefined();
  });

  test("parseItemsResource keeps an armor set's most XP and its upgrade, in either order", () => {
    const belt = { id: "SPONGE_BELT", name: "", material: "", museum_data: { category: "FISHING", armor_set_donation_xp: { SPONGE: 5 } } };
    const helmet = {
      id: "SPONGE_HELMET",
      name: "",
      material: "",
      museum_data: { category: "FISHING", armor_set_donation_xp: { SPONGE: 6 }, parent: { SPONGE: "SHARK_SCALE" } },
    };
    for (const items of [[belt, helmet], [helmet, belt]])
      expect(parseItemsResource({ lastUpdated: 0, items }).museum.SPONGE).toEqual({ category: "FISHING", xp: 6, upgrade: "SHARK_SCALE" });
  });
}
