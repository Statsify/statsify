/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemTexture, RawItem } from "#types";

/** The texture hash in a base64 skin value (`{"textures":{"SKIN":{"url":…}}}`). */
export function skinHash(value: string): string | undefined {
  const { textures } = JSON.parse(Buffer.from(value, "base64").toString("utf8")) as {
    textures?: { SKIN?: { url?: string } };
  };

  return textures?.SKIN?.url?.split("/").at(-1);
}

export function textureOf(item: RawItem): ItemTexture {
  const value = item.tag?.SkullOwner?.Properties?.textures?.[0]?.Value;
  const skin = value && skinHash(value);
  if (skin) return { kind: "head", skin };

  const color = item.tag?.display?.color;
  return { kind: "item", id: item.id, damage: item.Damage, ...(color === undefined ? {} : { color }) };
}
