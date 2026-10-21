/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IS_ENUM, ValidateBy, buildMessage } from "class-validator";
import { Player, getLeaderboardFields } from "@statsify/schemas";
import { UuidDto } from "./uuid.dto.js";

const fields = getLeaderboardFields(Player).map(([key]) => key);
const fieldSet = new Set(fields);

// @IsEnum(fields, { each: true }) rebuilt the list of every field for each value. This checks a
// Set instead and keeps IsEnum's name and message, which lists no values for an array
const IsLeaderboardField = ValidateBy(
  {
    name: IS_ENUM,
    validator: {
      validate: (value) => fieldSet.has(value),
      defaultMessage: buildMessage(
        (eachPrefix) => `${eachPrefix}$property must be one of the following values: `,
        { each: true }
      ),
    },
  },
  { each: true }
);

export class PlayerRankingsDto extends UuidDto {
  @ApiProperty({ enum: fields, type: [String] })
  @IsLeaderboardField
  public fields: string[];
}
