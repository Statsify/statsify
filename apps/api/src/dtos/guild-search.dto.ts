/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MAX_AUTOCOMPLETE_NAME_LENGTH } from "@statsify/api-client";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class GuildSearchDto extends createZodDto(
  z.object({ query: z.string().max(MAX_AUTOCOMPLETE_NAME_LENGTH) })
) {}
