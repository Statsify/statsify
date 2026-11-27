/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { UuidDto } from "./uuid.dto.js";
import { createZodDto } from "nestjs-zod";
import { sceneCamera } from "./scene-camera.dto.js";
import { z } from "zod";

export const KART_CAMERA = { width: 600, height: 450, yaw: -Math.PI / 6, pitch: Math.PI / 10 };

export class KartRenderDto extends createZodDto(
  sceneCamera(KART_CAMERA).extend({
    kart: z.string().describe("The player's stored skin_active, such as YELLOW_KART;DRAGON_TAMER"),
    uuid: UuidDto.schema.shape.uuid.optional().describe("The player seated in the kart. Without one, the kart is drawn empty"),
    helmet: z.string().optional().describe("The player's stored helmet_active, such as HELMET_5_5 or NO_HELMET"),
    jacket: z.string().optional().describe("The player's stored jacket_active, such as GOLD_JACKET, LEATHER_JACKET:RED or NO_JACKET"),
    pants: z.string().optional().describe("The player's stored pants_active, such as GOLD_PANTS or NO_PANTS"),
    shoes: z.string().optional().describe("The player's stored shoes_active, such as GOLD_SHOES or NO_SHOES"),
    extruded: z
      .enum(["true", "false"])
      .meta({ default: "false" })
      .transform((value) => value === "true")
      .optional()
      .describe("Draw the skin's outer layer in 3D"),
  })
) {}
