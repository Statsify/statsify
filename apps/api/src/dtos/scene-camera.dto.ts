/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { z } from "zod";

const MIN_SIZE = 64;
const MAX_SIZE = 1024;

// An empty value keeps the default angle, where z.coerce.number() would read "" as 0.
// The default sits on the number because the OpenAPI schema drops one set on the transform
const angle = (limit: number, fallback: number) =>
  z
    .literal("")
    .transform(() => undefined)
    .or(z.coerce.number().min(-limit).max(limit).meta({ default: fallback }))
    .optional();

const size = (fallback: number) => z.coerce.number().int().min(MIN_SIZE).max(MAX_SIZE).optional().meta({ default: fallback });

export const sceneCamera = (camera: { yaw: number; pitch: number; width: number; height: number }) =>
  z.object({
    yaw: angle(Math.PI * 2, camera.yaw).describe("Camera angle around the scene in radians: 0 faces the front, π the back"),
    pitch: angle(Math.PI / 2, camera.pitch).describe("Camera angle above the horizon in radians"),
    width: size(camera.width),
    height: size(camera.height),
  });
