/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { WARLORDS_CAMERA } from "./warlords-render.dto.js";
import { createZodDto } from "nestjs-zod";
import { queryBoolean } from "./skin-render.dto.js";
import { sceneCamera } from "./scene-camera.dto.js";
import { z } from "zod";

export const SMASH_CAMERA = WARLORDS_CAMERA.player;

export class SmashRenderDto extends createZodDto(
  sceneCamera(SMASH_CAMERA).extend({
    hero: z
      .string()
      .describe("The player's stored active_class, such as GENERAL_CLUCK"),
    master: queryBoolean("false")
      .optional()
      .describe(
        "Draw the hero's Master Skin, the player's stored masterArmor_<hero>",
      ),
  }),
) {}
