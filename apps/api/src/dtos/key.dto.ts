/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class AddKeyDto extends createZodDto(z.object({ name: z.string() })) {}

export class KeyParamDto extends createZodDto(z.object({ key: z.string().optional() })) {}

// The auth guard also takes the key from `?key=`, so the header can be missing
export class KeyHeaderDto extends createZodDto(z.object({ "x-api-key": z.string().optional() })) {}
