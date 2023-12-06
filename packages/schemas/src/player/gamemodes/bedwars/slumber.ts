/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "#metadata";

export class Slumber {

  @Field({ historical: { enabled: false }, leaderboard: { enabled: false } })
  public tickets: number;

  @Field()
  public ticketsAllTime: number;

  @Field({ historical: { enabled: false }, leaderboard: { enabled: false } })
  public wallet: number;

  public constructor(data: APIData = {}) {
    this.tickets = data.tickets;
    this.ticketsAllTime = data.total_tickets_earned;

    switch (data.bag_type) {
      case undefined:
        this.wallet = 25;
        break;
      case "LIGHT_SLUMBERS_WALLET":
        this.wallet = 99;
        break;
    }
  }
}