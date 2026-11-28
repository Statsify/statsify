/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  AutocompleteType,
  MAX_AUTOCOMPLETE_NAME_LENGTH,
} from "@statsify/api-client";
import { UserIdDto } from "./user.dto.js";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const type = z.enum(AutocompleteType).meta({ id: "AutocompleteType" });

export class AutocompleteDto extends createZodDto(
  UserIdDto.schema.extend({
    type,
    query: z.string().max(MAX_AUTOCOMPLETE_NAME_LENGTH),
  }),
) {}

export class AutocompleteHistoryDto extends createZodDto(
  UserIdDto.schema.extend({
    type,
    name: z
      .string()
      .max(MAX_AUTOCOMPLETE_NAME_LENGTH)
      .describe("A player's username or a guild's name"),
  }),
) {}
