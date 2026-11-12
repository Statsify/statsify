/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CacheDto } from "./cache.dto.js";
import { PlayerDto } from "./player.dto.js";
import { createZodDto } from "nestjs-zod";

export class CachedPlayerDto extends createZodDto(PlayerDto.schema.extend(CacheDto.schema.shape)) {}
