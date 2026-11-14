/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponse } from "./success.response.js";
import type {
  BingoView,
  ItemMatch,
  MayorView,
  PlayerRef,
  PriceView,
  SkyBlockProfileView,
  SkyBlockProfilesView,
} from "@statsify/skyblock";

export class GetSkyBlockProfilesResponse extends SuccessResponse {
  @ApiProperty({ type: Object, description: "The player, when the profiles were fetched, and a summary of each" })
  public profiles: SkyBlockProfilesView;
}

export class GetSkyBlockProfileResponse extends SuccessResponse {
  @ApiProperty({ type: Object, description: "One profile, with the requested sections of the player's member" })
  public profile: SkyBlockProfileView;
}

export class GetSkyBlockPriceResponse extends SuccessResponse {
  @ApiProperty({ type: Object, description: "One price key's bazaar product, lowest BIN and NPC price" })
  public price: PriceView;
}

export class GetSkyBlockItemsResponse extends SuccessResponse {
  @ApiProperty({ type: Object, isArray: true, description: "Up to 25 priced items, books and pets: id, name and rarity" })
  public items: ItemMatch[];
}

export class GetSkyBlockMayorResponse extends SuccessResponse {
  @ApiProperty({ type: Object, description: "The mayor in office, their perks and the minister's" })
  public mayor: MayorView;
}

export class GetSkyBlockBingoResponse extends SuccessResponse {
  @ApiProperty({ type: Object, description: "The player, this month's Bingo goals, and their points and completed goals" })
  public bingo: PlayerRef & BingoView;
}
