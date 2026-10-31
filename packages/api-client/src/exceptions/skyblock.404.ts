/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { NotFoundException } from "./base.404.js";

/**
 * skyblock: the player never played SkyBlock, or has no stored copy for a CACHE_ONLY lookup. profile: no profile by
 * that id or name. item: a price key search can't name. price: a key with no bazaar product, BIN listing or NPC price.
 */
export class SkyBlockNotFoundException extends NotFoundException {
  @ApiProperty({ required: false, description: "The item's name, when a key with no price was named" })
  public name?: string;

  public constructor(message: "skyblock" | "profile" | "item" | "price", name?: string) {
    super({ message, name });
  }
}
