/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CacheDto } from "./cache.dto.js";
import { IntersectionType } from "@nestjs/swagger";
import { PlayerDto } from "./player.dto.js";

export class CachedPlayerDto extends IntersectionType(PlayerDto, CacheDto) {}
