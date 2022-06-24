/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { NotFoundException as BaseNotFoundException } from "@nestjs/common";

export class NotFoundException extends BaseNotFoundException {
  @ApiProperty()
  public statusCode: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public error: string;

  public constructor(objectOrError?: string | any) {
    let error: any = { statusCode: 404, error: "Not Found" };

    if (typeof objectOrError === "string") {
      error.message = objectOrError;
    } else if (typeof objectOrError === "object") {
      error = { ...error, ...objectOrError };
    }

    super(error);
  }
}
