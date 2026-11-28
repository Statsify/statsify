/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DYES, type DyeColor } from "./tints.js";
import data from "../../data/minecraft-data.json" with { type: "json" };
import type { ItemStack } from "./item-stack.js";
import { DOWNLOAD_TIMEOUT, namespaced, withoutNamespace } from "./pack.js";

const items: Record<string, string | undefined> = data.items;
const durability: Record<string, number | undefined> = data.durability;
const effects: Record<string, string | undefined> = data.effects;
const materials: Record<string, number | undefined> = data.materials;
const names: Record<string, string | undefined> = data.legacyNames;

const MINECRAFT_DATA =
  "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/3.117.0/data/pc";

// Paths are inside the pinned release, like "1.8/items.json"
export async function fetchMinecraftData<T>(path: string): Promise<T> {
  const response = await fetch(`${MINECRAFT_DATA}/${path}`, {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT),
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json() as Promise<T>;
}

const POTION = 373;

// 1.8 potions keep their effect's id in the low four bits of Damage
const POTION_EFFECTS = [0, 10, 1, 12, 19, 6, 16, 0, 18, 5, 2, 8, 7, 13, 14, 0];
const LEVEL_II = 0x20;
const SPLASH = 0x40_00;

const WOOL_DYES = Object.keys(DYES) as DyeColor[];

const BANNER_PATTERNS: Record<string, string | undefined> = {
  b: "base",
  bl: "square_bottom_left",
  br: "square_bottom_right",
  tl: "square_top_left",
  tr: "square_top_right",
  bs: "stripe_bottom",
  ts: "stripe_top",
  ls: "stripe_left",
  rs: "stripe_right",
  cs: "stripe_center",
  ms: "stripe_middle",
  drs: "stripe_downright",
  dls: "stripe_downleft",
  ss: "small_stripes",
  cr: "cross",
  sc: "straight_cross",
  bt: "triangle_bottom",
  tt: "triangle_top",
  bts: "triangles_bottom",
  tts: "triangles_top",
  ld: "diagonal_left",
  rd: "diagonal_up_right",
  lud: "diagonal_up_left",
  rud: "diagonal_right",
  mc: "circle",
  mr: "rhombus",
  vh: "half_vertical",
  hh: "half_horizontal",
  vhr: "half_vertical_right",
  hhb: "half_horizontal_bottom",
  bo: "border",
  cbo: "curly_border",
  cre: "creeper",
  gra: "gradient",
  gru: "gradient_up",
  bri: "bricks",
  sku: "skull",
  flo: "flower",
  moj: "mojang",
};

export function legacyEffect(id: number) {
  const name = effects[id];
  return name ? namespaced(name) : undefined;
}

export function legacyBannerPattern(code: string) {
  const name = BANNER_PATTERNS[code];
  if (!name) throw new Error(`No banner pattern ${code}`);
  return namespaced(name);
}

// A banner's dye Damage runs the reverse of wool's order
export const legacyDye =(damage: number) => WOOL_DYES[15 - damage];

// Damage on a tool or armor piece is kept as wear
export function legacyItem(id: number, damage = 0): ItemStack | undefined {
  if (id === POTION) {
    const effect = legacyEffect(POTION_EFFECTS[damage & 0xf]);

    return {
      id: damage & SPLASH ? "minecraft:splash_potion" : "minecraft:potion",
      effects: effect
        ? [{ id: effect, amplifier: damage & LEVEL_II ? 1 : 0 }]
        : [],
    };
  }

  const name = items[`${id}:${damage}`] ?? items[id];
  if (!name) return;

  return {
    id: namespaced(name),
    damage: durability[name] && damage > 0 ? damage : undefined,
  };
}

export const legacyMaterialId = (name: string) => materials[name];

export const maxDamage = (id: string) => durability[withoutNamespace(id)];

export const legacyName = (id: string) => names[withoutNamespace(id)];
