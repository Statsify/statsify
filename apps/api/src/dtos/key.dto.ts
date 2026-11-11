/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export class AddKeyDto {
  public static schema = z.object({ name: z.string() });

  @ApiProperty()
  public name: string;
}

export class KeyParamDto {
  public static schema = z.object({ key: z.string() });

  @ApiProperty()
  public key: string;
}

export class KeyHeaderDto {
  @ApiProperty()
  public "x-api-key": string;
}
