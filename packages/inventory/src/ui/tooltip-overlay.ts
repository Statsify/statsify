/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { McInventory } from "./mc-inventory.js";
import { TOOLTIP_PADDING } from "../core/tooltip.js";

/** One tooltip canvas for the page, its text 12 GUI pixels right of and above the cursor as in 1.8 */
class TooltipOverlay {
  private canvas = document.createElement("canvas");
  private scale = 1;
  private owner?: McInventory;

  public constructor() {
    Object.assign(this.canvas.style, {
      position: "fixed",
      zIndex: "1000",
      pointerEvents: "none",
      imageRendering: "pixelated",
      display: "none",
    });

    document.body.append(this.canvas);

    // A tap opens a tooltip until the next tap anywhere else
    document.addEventListener("pointerdown", () => {
      this.hide();
      this.owner?.unhover();
      this.owner = undefined;
    });
  }

  public show(tooltip: OffscreenCanvas, scale: number, event: PointerEvent, owner: McInventory) {
    if (owner !== this.owner) this.owner?.unhover();
    this.owner = owner;

    this.canvas.width = tooltip.width;
    this.canvas.height = tooltip.height;
    this.canvas.getContext("2d")!.drawImage(tooltip, 0, 0);
    this.scale = scale;
    this.canvas.style.display = "block";
    this.move(event);
  }

  public move(event: PointerEvent) {
    const { width, height } = this.canvas;
    let left = event.clientX + (12 - TOOLTIP_PADDING) * this.scale;
    let top = event.clientY - (12 + TOOLTIP_PADDING) * this.scale;

    if (left + width > innerWidth) left = event.clientX - width - 12 * this.scale;
    if (top + height > innerHeight) top = innerHeight - height - 2 * this.scale;

    this.canvas.style.left = `${Math.max(0, left)}px`;
    this.canvas.style.top = `${Math.max(0, top)}px`;
  }

  public hide() {
    this.canvas.style.display = "none";
  }

  /** Hides the tooltip if `owner` shows it */
  public release(owner: McInventory) {
    if (owner !== this.owner) return;
    this.hide();
    this.owner = undefined;
  }
}

let overlay: TooltipOverlay | undefined;

export const tooltipOverlay = () => (overlay ??= new TooltipOverlay());
