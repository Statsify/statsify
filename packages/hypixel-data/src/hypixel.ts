/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARMOR, HOTBAR, hypixelItem } from "./kits.js";
import { type Compound, readNbt } from "./nbt.js";
import {
  type ItemStack,
  legacyBannerPattern,
  legacyDye,
  legacyEffect,
  namespaced,
} from "@statsify/textures";
import { gunzipSync } from "fflate";

const base64Bytes = (base64: string) =>
  Uint8Array.from(atob(base64), (char) => char.codePointAt(0)!);

// Hypixel stores an empty slot as {}
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
    BlockEntityTag?: {
      Base?: number;
      Patterns?: { Pattern: string; Color: number }[];
    };
  };
}

export const SKIN_HOST = "textures.minecraft.net";

// A head's SkullOwner textures value is base64 JSON
export function skinUrl(value: string) {
  const profile = JSON.parse(new TextDecoder().decode(base64Bytes(value))) as {
    textures?: { SKIN?: { url?: string } };
  };

  const url = profile.textures?.SKIN?.url;
  if (url === undefined) return undefined;

  const skin = new URL(url);
  if (skin.hostname !== SKIN_HOST)
    throw new Error(`${url} isn't on ${SKIN_HOST}`);

  // An https page can't fetch the texture server's http URLs
  skin.protocol = "https:";
  return skin.href;
}

function itemStack({
  id,
  Count,
  Damage,
  tag,
}: LegacyItem): ItemStack | undefined {
  if (id === undefined) return;

  const item = hypixelItem(id, Damage);
  if (!item) return;

  const texture = tag?.SkullOwner?.Properties?.textures?.[0]?.Value;
  const effects = tag?.CustomPotionEffects?.map(({ Id, Amplifier = 0 }) => {
    const effect = legacyEffect(Id);
    if (!effect) throw new Error(`No 1.8 effect ${Id}`);
    return { id: effect, amplifier: Amplifier };
  });

  const banner = tag?.BlockEntityTag;
  const patterns = banner?.Patterns?.map(({ Pattern, Color }) => ({
    pattern: legacyBannerPattern(Pattern),
    color: legacyDye(Color),
  }));

  return {
    ...item,
    // 1.8 colors a banner by its Base before its Damage
    id:
      banner?.Base === undefined
        ? item.id
        : namespaced(`${legacyDye(banner.Base)}_banner`),
    patterns: patterns?.length ? patterns : undefined,
    count: Count,
    name: tag?.display?.Name,
    lore: tag?.display?.Lore,
    color: tag?.display?.color,
    // Hypixel adds an empty ench list for the glint, which 1.8 draws for any
    enchanted: tag?.ench !== undefined || undefined,
    effects: effects?.length ? effects : item.effects,
    unbreakable: tag?.Unbreakable === 1 || undefined,
    hideFlags: tag?.HideFlags,
    skin: texture === undefined ? undefined : skinUrl(texture),
  };
}

export function fromHypixelNBT({
  data,
}: {
  data: number[];
}): (ItemStack | undefined)[] {
  const root = readNbt(gunzipSync(Uint8Array.from(data)));
  const items = root.i;
  if (!Array.isArray(items))
    throw new TypeError("Hypixel's inventory NBT should have an i list");

  return (items as LegacyItem[]).map(itemStack);
}

// The game shows the three main rows above the hotbar
export const playerInventoryOrder = <T>(slots: T[]) => [
  ...slots.slice(HOTBAR, ARMOR.boots),
  ...slots.slice(0, HOTBAR),
];
