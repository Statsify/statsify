/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { RenderOptions } from "@statsify/skin-renderer";
import { UuidDto } from "./uuid.dto.js";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const POSES = [
  "standing",
  "punch",
  "sneak",
  "jump",
  "swim",
  "fly",
] satisfies NonNullable<RenderOptions["pose"]>[];

const ARMOR_MATERIALS = [
  "leather",
  "chainmail",
  "iron",
  "gold",
  "diamond",
] as const;

export const SKULLS = [
  "skeleton",
  "wither_skeleton",
  "zombie",
  "creeper",
] as const;

// Texture URLs drop a hash's leading zeros, so some are under 64 long.
const TEXTURE_HASH = /^[\da-f]{1,64}$/;

const armorPiece = z.object({
  material: z.enum(ARMOR_MATERIALS),
  color: z.number().int().min(0).max(0xff_ff_ff).optional(),
  enchanted: z.boolean().optional(),
});

// z.undefined() would make the key required
const unset = z.never().optional();

// A helmet is exactly one of a material, a head or a skull
const helmet = z.union([
  armorPiece.extend({ head: unset, skull: unset }),
  z.object({
    head: z.string().regex(TEXTURE_HASH),
    material: unset,
    skull: unset,
  }),
  z.object({ skull: z.enum(SKULLS), material: unset, head: unset }),
]);

const armor = z.object({
  helmet: helmet.optional(),
  chestplate: armorPiece.optional(),
  leggings: armorPiece.optional(),
  boots: armorPiece.optional(),
});

export type ArmorPieceDto = z.infer<typeof armorPiece>;
export type ArmorDto = z.infer<typeof armor>;

export class SkinRenderDto extends createZodDto(
  UuidDto.schema.extend({
    // z.coerce.number() would read an empty ?yaw= as 0, the front.
    yaw: z
      .literal("")
      .transform(() => undefined)
      .or(
        z.coerce
          .number()
          .min(-Math.PI * 2)
          .max(Math.PI * 2),
      )
      .optional()
      .describe(
        "Camera angle around the player in radians: 0 faces the front, π the back",
      ),
    pose: z.enum(POSES).optional(),
    cape: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional()
      .describe("Draw the player's cape, if they have one"),
    // Bad JSON is an issue so it answers 400, where a throw here would be a 500
    armor: z
      .string()
      .transform((value, ctx) => {
        try {
          return JSON.parse(value);
        } catch {
          ctx.issues.push({
            code: "custom",
            message: "Invalid JSON",
            input: value,
          });
          return z.NEVER;
        }
      })
      .pipe(armor)
      .optional()
      .describe(
        'JSON, e.g. {"helmet":{"head":"5797c77ccee3c04c3deed770595ea83ea1e84c9a4629b753af5d351c0cc11a74"},"chestplate":{"material":"leather","color":16711680,"enchanted":true}}',
      ),
  }),
) {}
