/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARMOR, HOTBAR } from "./kits.js";
import { type Compound, readNbt } from "./nbt.js";
import { type ItemStack, legacyEffect, legacyItem } from "@statsify/textures";
import { gunzipSync } from "fflate";

const base64Bytes = (base64: string) => Uint8Array.from(atob(base64), (char) => char.codePointAt(0)!);

// The parts of a 1.8 item compound read here. An empty slot is {}
interface LegacyItem {
  id?: number;
  Count?: number;
  Damage?: number;
  tag?: {
    display?: { Name?: string; Lore?: string[]; color?: number };
    ench?: Compound[];
    CustomPotionEffects?: { Id: number; Amplifier?: number }[];
    Unbreakable?: number;
    HideFlags?: number;
    SkullOwner?: { Properties?: { textures?: { Value?: string }[] } };
  };
}

/** A skin's URL from a head's SkullOwner textures value, which is base64 JSON */
export function skinUrl(value: string) {
  const profile = JSON.parse(new TextDecoder().decode(base64Bytes(value))) as {
    textures?: { SKIN?: { url?: string } };
  };

  // The texture server allows cross-origin reads, but an https page can't fetch an http URL
  return profile.textures?.SKIN?.url?.replace(/^http:/, "https:");
}

/** One 1.8 item compound as an ItemStack, or undefined for an empty slot or an unknown id */
function itemStack({ id, Count, Damage, tag }: LegacyItem): ItemStack | undefined {
  if (id === undefined) return;

  const item = legacyItem(id, Damage);
  if (!item) return;

  const texture = tag?.SkullOwner?.Properties?.textures?.[0]?.Value;
  const effects = tag?.CustomPotionEffects?.flatMap(({ Id, Amplifier = 0 }) => {
    const effect = legacyEffect(Id);
    return effect ? [{ id: effect, amplifier: Amplifier }] : [];
  });

  return {
    ...item,
    count: Count,
    name: tag?.display?.Name,
    lore: tag?.display?.Lore,
    color: tag?.display?.color,
    // 1.8 glints any item with an ench list, and Hypixel adds an empty one for the glint
    enchanted: tag?.ench !== undefined || undefined,
    effects: effects?.length ? effects : item.effects,
    unbreakable: tag?.Unbreakable === 1 || undefined,
    hideFlags: tag?.HideFlags,
    skin: texture === undefined ? undefined : skinUrl(texture),
  };
}

/** Items from Hypixel's gzipped NBT as /player sends it, like the Pit's inv_contents, in their stored order */
export function fromHypixelNBT({ data }: { data: number[] }): (ItemStack | undefined)[] {
  const root = readNbt(gunzipSync(Uint8Array.from(data)));
  const items = root.i;
  if (!Array.isArray(items)) throw new Error("Hypixel's inventory NBT should have an i list");

  return (items as LegacyItem[]).map(itemStack);
}

/** A player inventory as the game shows it: the three main rows, then the hotbar */
export const playerInventoryOrder = <T>(slots: T[]) => [...slots.slice(HOTBAR, ARMOR.boots), ...slots.slice(0, HOTBAR)];
