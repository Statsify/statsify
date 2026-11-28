/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Its own entry, so a browser can build icon URLs without the package's data.
import type { ItemTexture } from "#types";

export const ICON_SIZES = [16, 32, 64] as const;

export type IconSize = (typeof ICON_SIZES)[number];

// 1.8's highest item id, the last music disc.
const MAX_ITEM_ID = 2267;
const MAX_DAMAGE = 32_767;

// One spelling per texture, so each has a single edge cache entry.
const NUMBER = "(0|[1-9]\\d{0,4})";
const ITEM_KEY = new RegExp(
  `^item-${NUMBER}-${NUMBER}(?:-(0|[1-9a-f][\\da-f]{0,5}))?$`,
);
// Texture URLs drop a hash's leading zeros, so some are under 64 long.
const HEAD_KEY = /^head-([\da-f]{1,64})$/;

export function iconKey(texture: ItemTexture): string {
  if (texture.kind === "head") return `head-${texture.skin}`;
  const color =
    texture.color === undefined ? "" : `-${texture.color.toString(16)}`;
  return `item-${texture.id}-${texture.damage}${color}`;
}

export function parseIconKey(key: string): ItemTexture | undefined {
  const head = HEAD_KEY.exec(key);
  if (head) return { kind: "head", skin: head[1] };

  const item = ITEM_KEY.exec(key);
  if (!item) return undefined;

  const [id, damage] = [Number(item[1]), Number(item[2])];
  if (id > MAX_ITEM_ID || damage > MAX_DAMAGE) return undefined;

  return item[3] === undefined
    ? { kind: "item", id, damage }
    : { kind: "item", id, damage, color: Number.parseInt(item[3], 16) };
}

export const isIconSize = (size: number): size is IconSize =>
  ICON_SIZES.includes(size as IconSize);

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("parseIconKey", () => {
    it("should read back every key iconKey writes", () => {
      const textures: ItemTexture[] = [
        { kind: "item", id: 0, damage: 0 },
        { kind: "item", id: 2267, damage: 32_767 },
        { kind: "item", id: 301, damage: 0, color: 0xff_ff_ff },
        { kind: "item", id: 301, damage: 0, color: 0 },
        { kind: "head", skin: "a".repeat(64) },
        { kind: "head", skin: "1".repeat(61) },
      ];
      for (const texture of textures) {
        expect(parseIconKey(iconKey(texture))).toEqual(texture);
      }
    });

    it("should refuse keys outside 1.8's ranges or the one spelling", () => {
      for (const key of [
        "item-2268-0",
        "item-1-32768",
        "item-01-0",
        "item-1-0-1000000",
        "item-1-0-0a",
        "item-1-0-FF",
        "item--1-0",
        "item-1",
        "head-",
        "head-ABC",
        `head-${"a".repeat(65)}`,
        "head-abc.png",
      ]) {
        expect(parseIconKey(key)).toBeUndefined();
      }
    });
  });
}
