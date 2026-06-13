/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ApiService, type InteractionAttachment } from "@statsify/discord";
import { createCanvas } from "@statsify/rendering";

export async function minecraftHeadAttachment(
  apiService: ApiService,
  uuid: string,
  size = 160
): Promise<InteractionAttachment> {
  const head = await apiService.getPlayerHead(uuid, size);

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(head, 0, 0, size, size);

  return {
    name: uuid,
    data: await canvas.toBuffer("png"),
    type: "image/png",
  };
}
