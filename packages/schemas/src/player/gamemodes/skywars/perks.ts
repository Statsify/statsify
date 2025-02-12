/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "#metadata";

export class SkyWarsPerks {
  @Field()
  public slot1?: string;

  @Field()
  public slot2?: string;

  @Field()
  public slot3?: string;

  @Field()
  public slot4?: string;

  @Field()
  public slot5?: string;

  @Field()
  public slot6?: string;

  public constructor(data: APIData) {
    this.slot1 = formatPerk(data["1"]);
    this.slot2 = formatPerk(data["2"]);
    this.slot3 = formatPerk(data["3"]);
    this.slot4 = formatPerk(data["4"]);
    this.slot5 = formatPerk(data["5"]);
    this.slot6 = formatPerk(data["6"]);
  }
}

function formatPerk(perk?: string): string | undefined {
  return perk?.replace("solo_", "")?.replace("team_", "");
}
