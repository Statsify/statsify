/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Bazaar } from "./types.js";
import type { RawBazaar } from "./raw.js";

export function parseBazaar(raw: RawBazaar): Bazaar {
  return {
    lastUpdated: raw.lastUpdated,
    products: Object.fromEntries(
      Object.entries(raw.products).map(([id, { buy_summary, sell_summary, quick_status }]) => [
        id,
        {
          id,
          instantBuy: buy_summary[0]?.pricePerUnit,
          instantSell: sell_summary[0]?.pricePerUnit,
          buyPrice: quick_status.buyPrice,
          sellPrice: quick_status.sellPrice,
          buyMovingWeek: quick_status.buyMovingWeek,
          sellMovingWeek: quick_status.sellMovingWeek,
        },
      ])
    ),
  };
}
