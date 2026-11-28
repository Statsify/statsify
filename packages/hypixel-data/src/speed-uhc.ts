/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemStack } from "@statsify/textures";
import dumped from "../data/speed-uhc.json" with { type: "json" };
import { kitKey } from "./kits.js";

// Built by scripts/import-dump.ts from the Speed UHC Shop and Gear Selector
const KITS = dumped as Record<string, Record<string, (ItemStack | null)[]>>;

// An item named in Hypixel's words, like Pig Egg, leaves its slot empty
export function fromSpeedUhcKit(
  id: string,
): (ItemStack | undefined)[] | undefined {
  const [, mode, name] = /^kit_basic_([a-z]+)_(.+)$/.exec(id) ?? [];
  if (!mode || !name) throw new Error(`${id} isn't a Speed UHC kit id`);
  return KITS[mode]?.[kitKey(name)]?.map((item) => item ?? undefined);
}
