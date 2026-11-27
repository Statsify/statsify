/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type InventoryLayout,
  InventoryRenderer,
  type InventorySize,
  LAYOUTS,
  TITLE_ORIGIN,
  countOrigin,
  slotAt,
  slotOrigin,
} from "../core/inventory.js";
import { context, createCanvas } from "../core/canvas.js";
import { Atlas } from "../core/atlas.js";
import { IconCache } from "../core/icon-cache.js";
import { ItemRenderer, MS_PER_TICK } from "../core/item-renderer.js";
import type { ItemStack } from "../core/item-stack.js";
import type { PackStack } from "../core/pack.js";
import type { TextComponent } from "../core/text.js";
import { tooltipOverlay } from "./tooltip-overlay.js";

/** What an atlas inventory's `mc-tooltip-change` events carry while a slot with an item is hovered */
export interface TooltipChange {
  item: ItemStack;
  slot: number;
  lines: TextComponent[];
  clientX: number;
  clientY: number;
  pointerType: string;
}

const HIGHLIGHT = "rgba(255, 255, 255, 0.5)";

// The site's Minecraft.ttf has 16 GUI pixels to the em, and trimming each line to its cap height
// puts a glyph's top where the game draws it
const STYLE = `
  .frame { position: relative; width: fit-content; }
  canvas { display: block; image-rendering: pixelated; }
  .text { position: absolute; inset: 0; pointer-events: none; white-space: pre; font-family: var(--mc-inventory-font, "Minecraft"); }
  .text > span { position: absolute; line-height: 0.5em; text-box: trim-both cap alphabetic; }
  [part="title"] { color: #404040; }
  [part="count"] { color: #ffffff; text-shadow: var(--gui-pixel) var(--gui-pixel) 0 #3f3f3f; }
  .highlight { position: absolute; display: none; pointer-events: none; background: ${HIGHLIGHT}; }
`;

interface Resources {
  renderer: Promise<InventoryRenderer>;
  tooltips: WeakMap<ItemStack, { scale: number; canvas: OffscreenCanvas }>;
}

const cache = new IconCache();
const resources = new WeakMap<PackStack | Atlas, Resources>();

/** A player head's skin from the texture server, which allows cross-origin reads */
async function fetchSkin(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);
  return new Uint8Array(await response.arrayBuffer());
}

function resourcesFor(pack: PackStack | Atlas) {
  let shared = resources.get(pack);

  if (!shared) {
    shared = {
      renderer:
        pack instanceof Atlas
          ? Promise.resolve(pack.inventoryRenderer(cache, fetchSkin))
          : InventoryRenderer.load(pack, new ItemRenderer(pack, cache, fetchSkin)),
      tooltips: new WeakMap(),
    };
    resources.set(pack, shared);
  }

  return shared;
}

/** What the last full draw made, which ticks and hovers draw over */
interface View {
  renderer: InventoryRenderer;
  tooltips: Resources["tooltips"];
  size: InventorySize;
  atlas: boolean;
  /** The slots it drew, which can trail `slots` until the next draw finishes */
  items: (ItemStack | undefined)[];
  /** The inventory without its moving slots' contents */
  still: OffscreenCanvas;
  composed: OffscreenCanvas;
}

/**
 * <mc-inventory>: a container drawn the way Minecraft draws one, from a resource pack or an atlas.
 * With an atlas, the title and counts are HTML, and the page draws tooltips from `mc-tooltip-change`
 */
export class McInventory extends HTMLElement {
  public static observedAttributes = ["rows", "cols", "scale", "label", "layout", "freeze"];

  // Inventories with moving slots share one clock, so their animations stay in step. It runs on
  // animation frames, which browsers pause in background tabs
  private static playing = new Set<McInventory>();
  private static clock = 0;
  private static frame?: number;

  private canvas = document.createElement("canvas");
  private text = document.createElement("div");
  private highlight = document.createElement("div");
  private packStack?: PackStack | Atlas;
  private items: (ItemStack | undefined)[] = [];
  private hovered = -1;
  private drawing = 0;
  private view?: View;
  /** Slots whose icons change from tick to tick, and their icons at the current tick */
  private moving: number[] = [];
  private movingIcons: (OffscreenCanvas | undefined)[] = [];
  private stepping = false;
  private onScreen = false;
  private tooltipOpen = false;

  private observer = new IntersectionObserver((entries) => {
    this.onScreen = entries.at(-1)!.isIntersecting;
    this.updatePlaying();
  });

  private static run(time: number) {
    const tick = Math.floor(time / MS_PER_TICK);

    if (tick !== McInventory.clock) {
      McInventory.clock = tick;
      for (const inventory of McInventory.playing) void inventory.step();
    }

    McInventory.frame = McInventory.playing.size > 0 ? requestAnimationFrame(McInventory.run) : undefined;
  }

  public constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE;
    const frame = document.createElement("div");
    frame.className = "frame";
    this.text.className = "text";
    this.highlight.className = "highlight";
    frame.append(this.canvas, this.text, this.highlight);
    root.append(style, frame);

    this.canvas.addEventListener("pointermove", (event) => this.hover(event));
    this.canvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      this.unhover();
      this.hover(event);
    });
    // A touch the browser takes over for a scroll ends in pointercancel
    this.canvas.addEventListener("pointercancel", () => this.unhover());
    this.canvas.addEventListener("pointerleave", (event) => {
      // A lifted finger leaves too, which would close the tooltip its tap opened
      if (event.pointerType === "touch") return;
      this.unhover();
    });
  }

  public get pack() {
    return this.packStack;
  }

  public set pack(pack: PackStack | Atlas | undefined) {
    this.packStack = pack;
    this.unhover();
    void this.draw();
  }

  public get slots() {
    return this.items;
  }

  public set slots(slots: (ItemStack | undefined)[]) {
    this.items = slots;
    this.unhover();
    void this.draw();
  }

  public connectedCallback() {
    this.observer.observe(this.canvas);
    void this.draw();
  }

  public disconnectedCallback() {
    this.observer.unobserve(this.canvas);
    this.unhover();
    this.onScreen = false;
    this.updatePlaying();
  }

  public attributeChangedCallback() {
    void this.draw();
  }

  public unhover() {
    if (this.hovered < 0) return;
    this.hovered = -1;
    this.show();
    tooltipOverlay().release(this);
    this.changeTooltip();
  }

  private get size(): InventorySize {
    const layout = LAYOUTS[this.getAttribute("layout") as InventoryLayout] ?? LAYOUTS.chest;
    return {
      rows: Number(this.getAttribute("rows") ?? layout.rows),
      cols: Number(this.getAttribute("cols") ?? layout.cols),
      scale: Number(this.getAttribute("scale") ?? 2),
      title: this.getAttribute("label") ?? "",
    };
  }

  private get tick() {
    return this.hasAttribute("freeze") ? 0 : McInventory.clock;
  }

  private hover(event: PointerEvent) {
    if (!this.view) return;

    const { renderer, tooltips, size, atlas, items } = this.view;
    const bounds = this.canvas.getBoundingClientRect();
    const slot = slotAt(
      size,
      (event.clientX - bounds.left) / (size.scale * (bounds.width / this.canvas.width)),
      (event.clientY - bounds.top) / (size.scale * (bounds.height / this.canvas.height)),
    );
    const overlay = tooltipOverlay();

    if (slot === this.hovered) {
      if (atlas) this.changeTooltip(event);
      else overlay.move(event);
      return;
    }

    this.hovered = slot;
    this.show();

    if (atlas) {
      overlay.claim(this);
      this.changeTooltip(event);
      return;
    }

    const item = items[slot];
    if (!item) {
      overlay.claim(this);
      overlay.hide();
      return;
    }

    let tooltip = tooltips.get(item);

    if (tooltip?.scale !== size.scale) {
      tooltip = { scale: size.scale, canvas: renderer.tooltip(item, size.scale, this.tick) };
      tooltips.set(item, tooltip);
    }

    overlay.show(tooltip.canvas, size.scale, event, this);
  }

  /** Tells the page which item's tooltip to show, or null once none is */
  private changeTooltip(event?: PointerEvent) {
    const item = event && this.view?.items[this.hovered];
    if (!item && !this.tooltipOpen) return;
    this.tooltipOpen = Boolean(item);

    const detail: TooltipChange | null =
      item && this.view
        ? {
            item,
            slot: this.hovered,
            lines: this.view.renderer.lines(item),
            clientX: event.clientX,
            clientY: event.clientY,
            pointerType: event.pointerType,
          }
        : null;

    const change = () => new CustomEvent("mc-tooltip-change", { detail, bubbles: true, composed: true });
    this.dispatchEvent(change());
    // A removed element's events no longer reach the page, so its last close goes to the document too
    if (!this.isConnected) document.dispatchEvent(change());
  }

  private placeText(size: InventorySize, shown: (ItemStack | undefined)[], width: number) {
    const labels: HTMLSpanElement[] = [];

    const place = (part: string, text: string, top: number, side: "left" | "right", offset: number) => {
      const label = document.createElement("span");
      label.setAttribute("part", part);
      label.textContent = text;
      label.style.top = `${top * size.scale}px`;
      label.style[side] = `${offset * size.scale}px`;
      labels.push(label);
    };

    const [titleX, titleY] = TITLE_ORIGIN;
    if (size.title) place("title", size.title, titleY, "left", titleX);

    for (const [slot, item] of shown.entries()) {
      if (!item?.count || item.count <= 1) continue;
      const [right, top] = countOrigin(size, slot);
      place("count", `${item.count}`, top, "right", width - right);
    }

    this.text.style.fontSize = `${16 * size.scale}px`;
    this.text.style.setProperty("--gui-pixel", `${size.scale}px`);
    this.text.replaceChildren(...labels);
  }

  private async draw() {
    if (!this.isConnected || !this.packStack) return;

    const drawing = ++this.drawing;
    const size = this.size;
    const tick = this.tick;
    const atlas = this.packStack instanceof Atlas;
    const resources = resourcesFor(this.packStack);
    const renderer = await resources.renderer;
    if (drawing !== this.drawing) return;

    const shown = this.items.slice(0, size.rows * size.cols);
    const frozen = this.hasAttribute("freeze");
    const moving = shown.flatMap((item, slot) => (item && !frozen && renderer.animates(item) ? [slot] : []));

    const [still, icons] = await Promise.all([
      renderer.draw(shown.map((item, slot) => (moving.includes(slot) ? undefined : item)), size, tick),
      Promise.all(moving.map((slot) => renderer.icon(shown[slot]!, size.scale, tick))),
    ]);

    if (drawing !== this.drawing) return;

    this.view = {
      renderer,
      tooltips: resources.tooltips,
      size,
      atlas,
      items: shown,
      still,
      composed: createCanvas(still.width, still.height),
    };
    this.moving = moving;
    this.movingIcons = icons;
    this.canvas.width = still.width;
    this.canvas.height = still.height;
    if (atlas) this.placeText(size, shown, still.width / size.scale);
    else this.text.replaceChildren();
    this.show();
    this.updatePlaying();
  }

  /** Draws the moving slots' icons for the clock's tick */
  private async step() {
    const view = this.view;
    if (this.stepping || !view) return;
    this.stepping = true;

    const { renderer, size, items } = view;

    try {
      const icons = await Promise.all(this.moving.map((slot) => renderer.icon(items[slot]!, size.scale, this.tick)));

      if (view === this.view) {
        this.movingIcons = icons;
        this.show();
      }
    } finally {
      this.stepping = false;
    }
  }

  /** The still inventory with the moving slots and the hovered slot's highlight over it */
  private show() {
    if (!this.view) return;

    const { renderer, size, atlas, items, still, composed } = this.view;
    const ctx = context(composed);
    ctx.clearRect(0, 0, composed.width, composed.height);
    ctx.drawImage(still, 0, 0);

    for (const [index, slot] of this.moving.entries()) {
      renderer.drawSlot(ctx, size, slot, items[slot], this.movingIcons[index]);
    }

    const origin = this.hovered >= 0 ? slotOrigin(size, this.hovered) : undefined;
    this.highlight.style.display = atlas && origin ? "block" : "none";

    if (origin) {
      const [left, top, side] = [(origin[0] + 1) * size.scale, (origin[1] + 1) * size.scale, 16 * size.scale];

      // An atlas's counts are HTML over the canvas, so its highlight has to be too, to dim them as 1.8 does
      if (atlas) {
        Object.assign(this.highlight.style, { left: `${left}px`, top: `${top}px`, width: `${side}px`, height: `${side}px` });
      } else {
        ctx.fillStyle = HIGHLIGHT;
        ctx.fillRect(left, top, side, side);
      }
    }

    const screen = this.canvas.getContext("2d")!;
    screen.clearRect(0, 0, this.canvas.width, this.canvas.height);
    screen.drawImage(composed, 0, 0);
  }

  private updatePlaying() {
    if (this.onScreen && this.moving.length > 0) McInventory.playing.add(this);
    else McInventory.playing.delete(this);

    if (McInventory.playing.size > 0 && McInventory.frame === undefined) {
      McInventory.frame = requestAnimationFrame(McInventory.run);
    }
  }
}

if (!customElements.get("mc-inventory")) customElements.define("mc-inventory", McInventory);
