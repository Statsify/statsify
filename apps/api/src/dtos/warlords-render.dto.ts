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

export const WARLORDS_CAMERA = {
  player: { width: 600, height: 800, yaw: -Math.PI / 6, pitch: Math.PI / 18 },
  weapon: { width: 600, height: 600, yaw: -Math.PI / 6, pitch: Math.PI / 18 },
};

const selection = z.coerce.number().int().min(0).optional();

export class WarlordsRenderDto extends createZodDto(
  sceneCamera(WARLORDS_CAMERA.player, {
    height: `${WARLORDS_CAMERA.weapon.height} for a weapon alone`,
  }).extend({
    uuid: UuidDto.schema.shape.uuid
      .optional()
      .describe("The player standing in their class's helmet and armor. Without one, only the weapon is drawn"),
    class: z.string().optional().describe("The player's stored chosen_class: mage, warrior, paladin or shaman. Needed with a uuid"),
    helmet: selection.meta({ default: 0, description: "The class's stored <class>_helmet_selection, from 0 to 3" }),
    armor: selection.meta({ default: 0, description: "The class's stored <class>_armor_selection, from 0 to 2" }),
    team: z.string().optional().meta({ default: "blue", description: "The team colors the helmet and armor are drawn in: blue or red" }),
    weapon: z.string().optional().describe("The held weapon's stored weapon_inventory material, such as STONE_HOE"),
    extruded: z
      .enum(["true", "false"])
      .meta({ default: "false" })
      .transform((value) => value === "true")
      .optional()
      .describe("Draw the skin's outer layer in 3D"),
  })
) {}
