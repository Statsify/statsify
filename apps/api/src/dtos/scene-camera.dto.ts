/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { queryAngle } from "./skin-render.dto.js";
import { z } from "zod";

const MIN_SIZE = 64;
const MAX_SIZE = 1024;

const size = (fallback: number) => z.coerce.number().int().min(MIN_SIZE).max(MAX_SIZE).optional().meta({ default: fallback });

export const sceneCamera = (
  camera: { yaw: number; pitch: number; width: number; height: number },
  descriptions: { yaw?: string; pitch?: string; height?: string } = {}
) =>
  z.object({
    yaw: queryAngle(Math.PI * 2, camera.yaw).describe(descriptions.yaw ?? "Camera angle around the scene in radians: 0 faces the front, π the back"),
    pitch: queryAngle(Math.PI / 2, camera.pitch).describe(descriptions.pitch ?? "Camera angle above the horizon in radians"),
    width: size(camera.width),
    height: size(camera.height).meta({ description: descriptions.height }),
  });
