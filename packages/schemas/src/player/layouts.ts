/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "@statsify/util";
import { Field } from "#metadata";

// A game's layouts are one string, `name=slot0,slot1,,slot3;name=…`. A run of four or more empty
// slots is `*N`, and a SkyWars slot can hold several tokens joined by `+`
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
    for (const [slot, token] of Object.entries(layout)) slots[Number(slot)] = String(token);
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
 * `{ "ITEM:damage:enchantments": slot | slot[] }`, as SkyWars sends kit layouts, stored with the
 * enchantment ids joined by `/`, since commas separate slots
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
    const stacks = slots.map((tokens) =>
      tokens ? tokens.split("+").map((token) => (token.includes(":") ? token : `${token}:0`).replaceAll("/", ",")) : [],
    );
    const layout: Record<string, number[]> = {};

    // A shared slot keeps its items in Hypixel's key order, which decides the one the game shows,
    // so an item goes in once it's first in every slot it shares
    for (;;) {
      const item = stacks
        .map((stack) => stack[0])
        .find((first) => first && stacks.every((stack) => stack[0] === first || !stack.includes(first)));
      if (!item) return layout;

      layout[item] = [];
      for (const [slot, stack] of stacks.entries()) {
        if (stack[0] !== item) continue;
        layout[item].push(slot);
        stack.shift();
      }
    }
  },
};

const MIN_SKIP = 4;

function packSlots(slots: Slots) {
  const tokens = Array.from(slots, (slot) => slot ?? "");
  while (tokens.length > 0 && !tokens.at(-1)) tokens.pop();

  const packed: string[] = [];

  for (let slot = 0; slot < tokens.length; slot++) {
    let end = slot;
    while (!tokens[end]) end++;

    if (end - slot >= MIN_SKIP) {
      packed.push(`*${end - slot}`);
      slot = end - 1;
    } else {
      packed.push(tokens[slot]);
    }
  }

  return packed.join(",");
}

// A saved layout with every slot emptied is kept as `name=`, since a missing one means the default
function encodeLayouts(layouts: [name: string, slots: Slots][]) {
  return layouts.map(([name, slots]) => `${name}=${packSlots(slots)}`).join(";");
}

function collectLayouts<T>(data: APIData, pattern: RegExp, shape: LayoutShape<T>) {
  return encodeLayouts(
    Object.entries(data).flatMap(([key, layout]): [string, Slots][] => {
      const match = pattern.exec(key);
      return match && typeof layout === "object" && layout !== null ? [[match[1], shape.slots(layout)]] : [];
    }),
  );
}

/** Stored layouts by name, each back in the shape Hypixel sends it */
export function decodeLayouts<T>(layouts: string, shape: LayoutShape<T>) {
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

// Pit inventories arrive as `{ type: 0, data: [signed bytes] }` of gzipped NBT
const encodeNbt = (nbt?: { data?: number[] }) => (Array.isArray(nbt?.data) ? Buffer.from(nbt.data).toString("base64") : "");

export class PlayerLayouts {
  @Field()
  public bedwars: string;

  @Field()
  public duels: string;

  @Field()
  public skywars: string;

  @Field()
  public blitzsg: string;

  @Field()
  public megawalls: string;

  @Field()
  public pitInventory: string;

  @Field()
  public pitArmor: string;

  public constructor(stats: APIData) {
    const { favourites_2: quickBuy, favorite_slots: hotbar } = stats.Bedwars ?? {};
    this.bedwars = encodeLayouts(
      Object.entries({ quickBuy, hotbar }).flatMap(([name, list]): [string, Slots][] =>
        typeof list === "string" ? [[name, LIST_LAYOUT.slots(list)]] : [],
      ),
    );

    this.duels = collectLayouts(stats.Duels ?? {}, /^layout_(.+)$/, SLOT_LAYOUT);
    this.skywars = collectLayouts(stats.SkyWars ?? {}, /^kit_(.+)_inventory$/, ITEM_LAYOUT);
    this.blitzsg = collectLayouts(stats.HungerGames ?? {}, /^(.+)Inventory$/, LEGACY_LAYOUT);
    this.megawalls = collectLayouts(stats.Walls3 ?? {}, /^(.+)Inventory$/, LEGACY_LAYOUT);

    this.pitInventory = encodeNbt(stats.Pit?.profile?.inv_contents);
    this.pitArmor = encodeNbt(stats.Pit?.profile?.inv_armor);
  }
}
