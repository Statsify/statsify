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

  @Field({ leaderboard: { fieldName: "Total Slumber Tickets" } })
  public totalTickets: number;

  @Field({ historical: { enabled: false }, leaderboard: { enabled: false } })
  public wallet: number;

  public constructor(data: APIData = {}) {
    this.tickets = data.tickets;
    this.totalTickets = data.total_tickets_earned;

    switch (data.bag_type) {
      case "MINI_WALLET":
        this.wallet = 25;
        break;

      case "LIGHT_SLUMBERS_WALLET":
        this.wallet = 99;
        break;

      case "LIGHT_IMPERIAL_WALLET":
        this.wallet = 500;
        break;

      case "EXPLORERS_WALLET":
        this.wallet = 5000;
        break;

      case "HOTEL_STAFF_WALLET":
        this.wallet = 10_000;
        break;

      case "PLATINUM_MEMBERSHIP_WALLET":
        this.wallet = 100_000;
        break;

      default:
        this.wallet = 0;
        break;
    }
  }
}