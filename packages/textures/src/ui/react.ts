/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { createElement, useEffect, useRef } from "react";
import type { InventoryLayout } from "../core/inventory.js";
import type { ItemStack } from "../core/item-stack.js";
import type { McInventory, TooltipChange } from "./mc-inventory.js";
import type { Atlas } from "../core/atlas.js";
import type { PackStack } from "../core/pack.js";

export interface InventoryProps {
  pack: PackStack | Atlas;
  slots: (ItemStack | undefined)[];
  rows?: number;
  cols?: number;
  scale?: number;
  label?: string;
  layout?: InventoryLayout;
  freeze?: boolean;
  /** With an atlas, the item to show a tooltip for as the pointer moves, or null to close it */
  onTooltipChange?: (change: TooltipChange | null) => void;
}

/**
 * <mc-inventory> for React. The element loads only in the browser, and `pack` and `slots` wait for
 * it: React would set them as attributes on an element that isn't defined yet.
 */
export function Inventory({ pack, slots, onTooltipChange, ...attributes }: InventoryProps) {
  const ref = useRef<McInventory>(null);

  useEffect(() => {
    const fill = async () => {
      await import("./mc-inventory.js");
      if (!ref.current) return;
      ref.current.pack = pack;
      ref.current.slots = slots;
    };

    void fill();
  }, [pack, slots]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !onTooltipChange) return;

    const listener = (event: Event) => onTooltipChange((event as CustomEvent<TooltipChange | null>).detail);
    element.addEventListener("mc-tooltip-change", listener);
    return () => element.removeEventListener("mc-tooltip-change", listener);
  }, [onTooltipChange]);

  return createElement("mc-inventory", { ref, ...attributes });
}
