/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { UuidDto } from "./uuid.dto.js";
import { createZodDto } from "nestjs-zod";
import { queryBoolean } from "./skin-render.dto.js";
import { sceneCamera } from "./scene-camera.dto.js";
import { z } from "zod";

export const WARLORDS_CAMERA = {
  player: { width: 600, height: 800, yaw: -Math.PI / 6, pitch: Math.PI / 18 },
  weapon: { width: 600, height: 600, yaw: -Math.PI / 6, pitch: Math.PI / 18 },
  mount: {
    width: 600,
    height: 800,
    yaw: (-2 * Math.PI) / 9,
    pitch: (5 * Math.PI) / 72,
  },
};

const selection = z.coerce.number().int().min(0).optional();

export class WarlordsRenderDto extends createZodDto(
  sceneCamera(WARLORDS_CAMERA.player, {
    yaw: `Camera angle around the scene in radians: 0 faces the front, π the back. ${WARLORDS_CAMERA.mount.yaw.toFixed(2)} with a mount`,
    pitch: `Camera angle above the horizon in radians. ${WARLORDS_CAMERA.mount.pitch.toFixed(2)} with a mount`,
    height: `${WARLORDS_CAMERA.weapon.height} for a weapon alone`,
  }).extend({
    uuid: UuidDto.schema.shape.uuid
      .optional()
      .describe(
        "The player in their class's helmet and armor. Without one, only the weapon or mount is drawn",
      ),
    class: z
      .string()
      .optional()
      .describe(
        "The player's stored chosen_class: mage, warrior, paladin or shaman. Needed with a uuid",
      ),
    helmet: selection.meta({
      default: 0,
      description: "The class's stored <class>_helmet_selection, from 0 to 3",
    }),
    armor: selection.meta({
      default: 0,
      description: "The class's stored <class>_armor_selection, from 0 to 2",
    }),
    team: z.string().optional().meta({
      default: "blue",
      description:
        "The team colors the helmet and armor are drawn in: blue or red",
    }),
    weapon: z
      .string()
      .optional()
      .describe(
        "The held weapon's stored weapon_inventory material, such as STONE_HOE",
      ),
    mount: z
      .string()
      .optional()
      .describe(
        "The player's stored selected_mount, such as noble_steed, which the player rides. Without a uuid, the mount is drawn alone",
      ),
    extruded: queryBoolean("false")
      .optional()
      .describe("Draw the skin's outer layer in 3D"),
  }),
) {}
