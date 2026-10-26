/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "@statsify/util";

/**
 * A game's inventory layouts are stored as one string, `name=slot0,slot1,,slot3;name=…`, so
 * a player with every kit arranged adds a few KB rather than an array element per slot.
 * Slots hold Hypixel's own item tokens and an empty slot is an empty string. A run of four or
 * more empty slots is written `*N` (`a,*26,b` puts b in slot 27), since kits often leave the
 * inventory empty between the hotbar and the armour, and trailing empty slots are left off.
 * A SkyWars slot can hold several tokens joined by `+`, one for each item a kit level could
 * put there.
 */
export type Slots = (string | undefined)[];

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

export function parseLayouts(layouts: string) {
  return new Map(
    layouts ?
      layouts.split(";").map((layout) => {
        const [name, slots] = layout.split("=");

        return [
          name,
          slots
            .split(",")
            .flatMap((slot) =>
              slot.startsWith("*") ? Array.from({ length: Number(slot.slice(1)) }, () => "") : [slot],
            ),
        ];
      }) :
      [],
  );
}

/** Every layout in `data` whose key matches `key`, named by the key's first capture */
export function collectLayouts(data: APIData, key: RegExp, slots: (layout: APIData) => Slots) {
  return encodeLayouts(
    Object.entries(data).flatMap(([name, layout]): [string, Slots][] => {
      const match = key.exec(name);
      return match && typeof layout === "object" ? [[match[1], slots(layout)]] : [];
    }),
  );
}

/** Comma-separated lists with "null" for an empty slot, like BedWars' quick buy */
export const listSlots = (list?: string): Slots =>
  list?.split(",").map((slot) => (slot === "null" ? undefined : slot)) ?? [];

/** `{ slot: token }`, as Duels, Blitz and Mega Walls send layouts */
export function slotSlots(layout: APIData, token = (value: string) => value) {
  const slots: Slots = [];

  for (const [slot, value] of Object.entries(layout)) {
    slots[Number(slot)] = token(String(value));
  }

  return slots;
}

/** `{ "ITEM:damage": slot | slot[] }`, as SkyWars sends kit layouts */
export function itemSlots(layout: APIData) {
  const slots: Slots = [];

  for (const [item, value] of Object.entries(layout)) {
    const token = item.replace(/:0$/, "");

    for (const slot of [value].flat().map(Number)) {
      slots[slot] = slots[slot] ? `${slots[slot]}+${token}` : token;
    }
  }

  return slots;
}

/** Blitz and Mega Walls' `id,damage` tokens as `id:damage`, with a damage of 0 left off */
export const legacyToken = (token: string) => token.replace(/,0$/, "").replace(",", ":");

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("packs layouts into one string and reads them back", () => {
    const layouts = encodeLayouts([
      ["quickBuy", listSlots("wool,null,tnt,null")],
      ["Scout", slotSlots({ 6: "345,0", 1: "373,16394", 0: "267,0" }, legacyToken)],
      ["basic_solo_frog", itemSlots({ "IRON_BOOTS:0": "2", "DIAMOND_BOOTS:0": [2], "POTION:2": "0" })],
      ["unused", listSlots("null,null")],
    ]);

    expect(layouts).toBe(
      "quickBuy=wool,,tnt;Scout=267,373:16394,*4,345;basic_solo_frog=POTION:2,,IRON_BOOTS+DIAMOND_BOOTS",
    );
    expect(parseLayouts(layouts).get("Scout")).toEqual(["267", "373:16394", "", "", "", "", "345"]);
    expect(parseLayouts(layouts).get("basic_solo_frog")).toEqual(["POTION:2", "", "IRON_BOOTS+DIAMOND_BOOTS"]);
    expect(parseLayouts("").size).toBe(0);
  });
}
