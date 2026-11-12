/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { UserFont } from "@statsify/schemas";
import { parentPort } from "node:worker_threads";
import { loadFonts } from "../fonts.js";
import { renderCard } from "./render.js";
import type { WorkerMessage, WorkerRequest } from "./protocol.js";

if (!parentPort) throw new Error("@statsify/profiles/worker only runs inside a worker thread");

const port = parentPort;
const post = (message: WorkerMessage, transfer: ArrayBuffer[] = []) => port.postMessage(message, transfer);

async function handle(request: WorkerRequest) {
  try {
    const png = await renderCard(request);
    post({ type: "done", id: request.id, png }, [png.buffer]);
  } catch (error) {
    post({ type: "error", id: request.id, message: error instanceof Error ? error.message : String(error) });
  }
}

// Site visitors never carry a premium theme, so only the default font pages are needed.
await loadFonts([UserFont.DEFAULT]);

port.on("message", (request: WorkerRequest) => {
  void handle(request);
});

post({ type: "ready" });
