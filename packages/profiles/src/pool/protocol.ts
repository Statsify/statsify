/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * The image sizes the site serves. `og` is the unfurl: the general card at its own size with the guild row, as the
 * bot sends it, rather than framed. `sig` is a forum signature (the Hypixel Forums cut signatures off at 200 px tall)
 * and `card` the general card at its native size. The variant is part of every request and cache key.
 */
export const IMAGE_VARIANTS = {
  og: { width: 808, height: 540 },
  sig: { width: 600, height: 200 },
  card: { width: 808, height: 540 },
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;

/** One card render, posted from the site to a worker. Documents are the API's JSON (`player.full`). */
export interface RenderRequest {
  card: "general";
  variant: ImageVariant;
  player: Record<string, unknown>;
  guild: Record<string, unknown> | null;
  /** When the stats were fetched (ms); `sig` and `card` print it, so a forum reader sees how old they are. */
  updatedAt: number;
  /** The full-body skin render as PNG bytes; the worker never talks to the API. */
  skin: Uint8Array;
}

export interface WorkerRequest extends RenderRequest {
  id: number;
}

export type WorkerMessage =
  | { type: "ready" }
  | { type: "done"; id: number; png: Uint8Array<ArrayBuffer> }
  | { type: "error"; id: number; message: string };
