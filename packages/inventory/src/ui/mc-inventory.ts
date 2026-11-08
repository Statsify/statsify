/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type InventoryLayout, InventoryRenderer, type InventorySize, LAYOUTS, slotAt, slotOrigin } from "../core/inventory.js";
import { context, createCanvas } from "../core/canvas.js";
import { IconCache } from "../core/icon-cache.js";
import type { ItemStack } from "../core/item-stack.js";
import type { PackStack } from "../core/pack.js";
import { tooltipOverlay } from "./tooltip-overlay.js";

const MS_PER_TICK = 50;

interface Resources {
  renderer: Promise<InventoryRenderer>;
  /** Each item's tooltip, drawn on its first hover */
  tooltips: WeakMap<ItemStack, { scale: number; canvas: OffscreenCanvas }>;
}

const cache = new IconCache();
const resources = new WeakMap<PackStack, Resources>();

function resourcesFor(pack: PackStack) {
  let shared = resources.get(pack);

  if (!shared) {
    shared = { renderer: InventoryRenderer.load(pack, cache), tooltips: new WeakMap() };
    resources.set(pack, shared);
  }

  return shared;
}

/** What the last full draw made, which ticks and hovers draw over */
interface View {
  renderer: InventoryRenderer;
  tooltips: Resources["tooltips"];
  size: InventorySize;
  /** The inventory without its moving slots' contents */
  still: OffscreenCanvas;
  composed: OffscreenCanvas;
}

/** <mc-inventory>: a container drawn the way Minecraft draws one, from a resource pack */
export class McInventory extends HTMLElement {
  public static observedAttributes = ["rows", "cols", "scale", "label", "layout", "freeze"];

  // Inventories with moving slots share one clock, so their animations stay in step. It runs on
  // animation frames, which browsers pause in background tabs
  private static playing = new Set<McInventory>();
  private static clock = 0;
  private static frame?: number;

  private canvas = document.createElement("canvas");
  private packStack?: PackStack;
  private items: (ItemStack | undefined)[] = [];
  private hovered = -1;
  private drawing = 0;
  private drawn = 0;
  private view?: View;
  /** Slots whose icons change from tick to tick, and their icons at the current tick */
  private moving: number[] = [];
  private movingIcons: (OffscreenCanvas | undefined)[] = [];
  private stepping = false;
  private onScreen = false;

  private observer = new IntersectionObserver((entries) => {
    this.onScreen = entries.at(-1)!.isIntersecting;
    this.play();
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
    this.canvas.style.imageRendering = "pixelated";
    this.canvas.style.display = "block";
    root.append(this.canvas);

    this.canvas.addEventListener("pointermove", (event) => this.hover(event));
    this.canvas.addEventListener("pointerdown", (event) => {
      // The overlay hides on any pointerdown that reaches the document
      event.stopPropagation();
      if (event.pointerType === "mouse") return;
      this.hovered = -1;
      this.hover(event);
    });
    this.canvas.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") return;
      tooltipOverlay().hide();
      this.unhover();
    });
  }

  public get pack() {
    return this.packStack;
  }

  public set pack(pack: PackStack | undefined) {
    this.packStack = pack;
    void this.draw();
  }

  public get slots() {
    return this.items;
  }

  public set slots(slots: (ItemStack | undefined)[]) {
    this.items = slots;
    void this.draw();
  }

  public connectedCallback() {
    this.observer.observe(this.canvas);
    void this.draw();
  }

  public disconnectedCallback() {
    this.observer.unobserve(this.canvas);
    this.onScreen = false;
    this.play();
  }

  public attributeChangedCallback() {
    void this.draw();
  }

  public unhover() {
    this.hovered = -1;
    this.show();
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

    const { renderer, tooltips, size } = this.view;
    const bounds = this.canvas.getBoundingClientRect();
    const slot = slotAt(size, (event.clientX - bounds.left) / size.scale, (event.clientY - bounds.top) / size.scale);
    const overlay = tooltipOverlay();

    if (slot === this.hovered) {
      overlay.move(event);
      return;
    }

    this.hovered = slot;
    this.show();

    const item = this.items[slot];
    if (!item) {
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

  private async draw() {
    if (!this.isConnected || !this.packStack) return;

    const drawing = ++this.drawing;
    const size = this.size;
    const tick = this.tick;
    const resources = resourcesFor(this.packStack);
    const renderer = await resources.renderer;
    const shown = this.items.slice(0, size.rows * size.cols);
    const frozen = this.hasAttribute("freeze");
    const moving = shown.flatMap((item, slot) => (item && !frozen && renderer.animates(item) ? [slot] : []));

    const [still, icons] = await Promise.all([
      renderer.draw(shown.map((item, slot) => (moving.includes(slot) ? undefined : item)), size, tick),
      Promise.all(moving.map((slot) => renderer.icon(shown[slot]!, size.scale, tick))),
    ]);

    if (drawing !== this.drawing) return;

    this.view = { renderer, tooltips: resources.tooltips, size, still, composed: createCanvas(still.width, still.height) };
    this.moving = moving;
    this.movingIcons = icons;
    this.canvas.width = still.width;
    this.canvas.height = still.height;
    this.show();

    this.drawn = drawing;
    this.play();
  }

  /** Draws the moving slots' icons for the clock's tick */
  private async step() {
    // Until the latest full draw finishes, moving can list slots that have since changed
    if (this.stepping || this.drawn !== this.drawing || !this.view) return;
    this.stepping = true;

    const drawing = this.drawing;
    const { renderer, size } = this.view;

    try {
      const icons = await Promise.all(this.moving.map((slot) => renderer.icon(this.items[slot]!, size.scale, this.tick)));

      if (drawing === this.drawing) {
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

    const { renderer, size, still, composed } = this.view;
    const ctx = context(composed);
    ctx.clearRect(0, 0, composed.width, composed.height);
    ctx.drawImage(still, 0, 0);

    for (const [index, slot] of this.moving.entries()) {
      renderer.drawSlot(ctx, size, slot, this.items[slot], this.movingIcons[index]);
    }

    if (this.hovered >= 0) {
      const [x, y] = slotOrigin(size, this.hovered);
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillRect((x + 1) * size.scale, (y + 1) * size.scale, 16 * size.scale, 16 * size.scale);
    }

    const screen = this.canvas.getContext("2d")!;
    screen.clearRect(0, 0, this.canvas.width, this.canvas.height);
    screen.drawImage(composed, 0, 0);
  }

  private play() {
    if (this.onScreen && this.moving.length > 0) McInventory.playing.add(this);
    else McInventory.playing.delete(this);

    if (McInventory.playing.size > 0 && McInventory.frame === undefined) {
      McInventory.frame = requestAnimationFrame(McInventory.run);
    }
  }
}

if (!customElements.get("mc-inventory")) customElements.define("mc-inventory", McInventory);
