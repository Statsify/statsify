/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CachedPlayerDto } from "./cached-player.dto.js";
import { ICON_SIZES } from "@statsify/skyblock/icon-key";
import { SKYBLOCK_SECTIONS } from "@statsify/skyblock";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class SkyBlockProfileDto extends createZodDto(
  CachedPlayerDto.schema.extend({
    profile: z.string().max(36).optional().meta({
      example: "Strawberry",
      description:
        "A profile id or cute name; the player's selected profile by default",
    }),
    sections: z
      .string()
      .transform((value) => value.split(",").filter(Boolean))
      .pipe(z.array(z.enum(SKYBLOCK_SECTIONS)))
      .meta({
        example: "skills,networth",
        description: `Comma-separated sections of the member to compute: ${SKYBLOCK_SECTIONS.join(", ")}`,
      }),
  }),
) {}

export class SkyBlockPriceDto extends createZodDto(
  z.object({
    item: z.string().max(100).meta({
      example: "HYPERION",
      description: "A price key from /skyblock/items",
    }),
  }),
) {}

export class SkyBlockIconDto extends createZodDto(
  z.object({
    texture: z
      .string()
      .max(70)
      .meta({
        example: "item-276-0",
        description: "item-<id>-<damage>[-<color hex>] or head-<skin hash>",
      }),
    size: z.coerce.number().pipe(z.literal(ICON_SIZES)),
    glint: z.coerce
      .number()
      .pipe(z.literal([0, 1]))
      .default(0),
  }),
) {}

export class SkyBlockItemsDto extends createZodDto(
  z.object({
    query: z.string().max(100).meta({ example: "hyperion" }),
  }),
) {}
