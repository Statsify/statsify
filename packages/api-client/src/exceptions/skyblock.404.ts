/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { NotFoundException } from "./base.404.js";

export class SkyBlockNotFoundException extends NotFoundException {
  @ApiProperty({
    required: false,
    description: "The item's name, for a key with no price",
  })
  public itemName?: string;

  public constructor(
    message: "skyblock" | "profile" | "item" | "price",
    itemName?: string,
  ) {
    super({ message, itemName });
  }
}
