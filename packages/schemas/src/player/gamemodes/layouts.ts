/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "@statsify/util";

// A game's layouts are one string, `name=slot0,slot1,,slot3;name=…`, a few KB for every kit. A run
// of four or more empty slots is `*N`, and a SkyWars slot can hold several tokens joined by `+`
type Slots = (string | undefined)[];

/** How a game sends its layouts, as slot tokens and back */
export interface LayoutShape<T> {
  slots(layout: T): Slots;
  layout(slots: string[]): T;
}

/** Comma-separated lists with "null" for an empty slot, like BedWars' quick buy */
export const LIST_LAYOUT: LayoutShape<string> = {
  slots: (list) => list.split(",").map((slot) => (slot === "null" ? undefined : slot)),
  layout: (slots) => slots.map((slot) => slot || "null").join(","),
};

/** `{ slot: token }`, as Duels sends layouts */
export const SLOT_LAYOUT: LayoutShape<Record<string, string>> = {
  slots(layout) {
    const slots: Slots = [];
    for (const [slot, token] of Object.entries(layout)) slots[Number(slot)] = token;
    return slots;
  },
  layout: (slots) => Object.fromEntries(slots.flatMap((token, slot) => (token ? [[slot, token]] : []))),
};

/** `{ slot: "id,damage" }`, as Blitz and Mega Walls send layouts, stored as `id:damage` without a damage of 0 */
export const LEGACY_LAYOUT: LayoutShape<Record<string, string>> = {
  slots: (layout) => SLOT_LAYOUT.slots(layout).map((token) => token?.replace(/,0$/, "").replace(",", ":")),
  layout(slots) {
    const legacy = slots.map((token) => token && (token.includes(":") ? token.replace(":", ",") : `${token},0`));
    return SLOT_LAYOUT.layout(legacy);
  },
};

/**
 * `{ "ITEM:damage:enchantments": slot | slot[] }`, as SkyWars sends kit layouts, stored without a
 * damage of 0 and with the enchantment ids joined by `/`, since commas separate slots
 */
export const ITEM_LAYOUT: LayoutShape<Record<string, string | number[]>> = {
  slots(layout) {
    const slots: Slots = [];

    for (const [item, value] of Object.entries(layout)) {
      const token = item.replace(/^([^:]+):0$/, "$1").replaceAll(",", "/");

      for (const slot of [value].flat().map(Number)) {
        slots[slot] = slots[slot] ? `${slots[slot]}+${token}` : token;
      }
    }

    return slots;
  },
  layout(slots) {
    const layout: Record<string, number[]> = {};

    for (const [slot, tokens] of slots.entries()) {
      for (const token of tokens ? tokens.split("+") : []) {
        const item = (token.includes(":") ? token : `${token}:0`).replaceAll("/", ",");
        (layout[item] ??= []).push(slot);
      }
    }

    return layout;
  },
};

const MIN_SKIP = 4;

function packSlots(slots: Slots) {
  const filled = Array.from(slots, (slot) => slot ?? "");
  while (filled.length > 0 && !filled.at(-1)) filled.pop();

  const packed: string[] = [];

  for (let slot = 0; slot < filled.length; slot++) {
    let end = slot;
    while (!filled[end]) end++;

    if (end - slot >= MIN_SKIP) {
      packed.push(`*${end - slot}`);
      slot = end - 1;
    } else {
      packed.push(filled[slot]);
    }
  }

  return packed.join(",");
}

export function encodeLayouts(layouts: [name: string, slots: Slots][]) {
  return layouts
    .map(([name, slots]) => [name, packSlots(slots)])
    .filter(([, slots]) => slots)
    .map(([name, slots]) => `${name}=${slots}`)
    .join(";");
}

export function collectLayouts<T>(data: APIData, key: RegExp, shape: LayoutShape<T>) {
  return encodeLayouts(
    Object.entries(data).flatMap(([name, layout]): [string, Slots][] => {
      const match = key.exec(name);
      return match ? [[match[1], shape.slots(layout)]] : [];
    }),
  );
}

/** Stored layouts by name, each back in the shape Hypixel sends it */
export function decodeLayouts<T>(layouts: string | undefined, shape: LayoutShape<T>) {
  return new Map(
    (layouts ? layouts.split(";") : []).map((layout) => {
      const [name, packed] = layout.split("=");

      const slots = packed
        .split(",")
        .flatMap((slot) => (slot.startsWith("*") ? Array.from({ length: Number(slot.slice(1)) }, () => "") : [slot]));

      return [name, shape.layout(slots)];
    }),
  );
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("stores layouts as one string and reads them back as Hypixel sends them", () => {
    const quickBuy = "wool,null,tnt,null";
    const kit = { 0: "267,0", 1: "373,16394", 6: "345,0" };
    const skywars = { "POTION:2": "0", "IRON_BOOTS:0": [2], "IRON_PICKAXE:0:32,34": [2], "DIAMOND_BOOTS:0:0": [3] };

    const stored = [
      encodeLayouts([["quickBuy", LIST_LAYOUT.slots(quickBuy)], ["unused", LIST_LAYOUT.slots("null,null")]]),
      encodeLayouts([["Scout", LEGACY_LAYOUT.slots(kit)]]),
      encodeLayouts([["basic_solo_frog", ITEM_LAYOUT.slots(skywars)]]),
    ];

    expect(stored).toEqual([
      "quickBuy=wool,,tnt",
      "Scout=267,373:16394,*4,345",
      "basic_solo_frog=POTION:2,,IRON_BOOTS+IRON_PICKAXE:0:32/34,DIAMOND_BOOTS:0:0",
    ]);

    expect(decodeLayouts(stored[0], LIST_LAYOUT).get("quickBuy")).toBe("wool,null,tnt");
    expect(decodeLayouts(stored[1], LEGACY_LAYOUT).get("Scout")).toEqual(kit);
    expect(decodeLayouts(stored[2], ITEM_LAYOUT).get("basic_solo_frog")).toEqual({
      "POTION:2": [0],
      "IRON_BOOTS:0": [2],
      "IRON_PICKAXE:0:32,34": [2],
      "DIAMOND_BOOTS:0:0": [3],
    });
    expect(decodeLayouts("", SLOT_LAYOUT).size).toBe(0);
  });
}
