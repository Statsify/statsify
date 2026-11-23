/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { HistoricalTimeData } from "./components/Historical/Header.js";
import type { Image } from "skia-canvas";
import type { Player, User } from "@statsify/schemas";
import type { LocalizeFunction } from "./localize.js";

export type { LocalizeFunction };

export type ProfileTime = "LIVE" | HistoricalTimeData;

export interface BaseProfileProps {
  skin: Image;
  player: Player;
  background: Image;
  logo: Image;
  user: User | null;
  badge?: Image;
  t: LocalizeFunction;
  time: ProfileTime;
}
