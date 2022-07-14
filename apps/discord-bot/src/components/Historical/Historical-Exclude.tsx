/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { If } from "../If";
import type { ProfileTime } from "../../commands/base.hypixel-command";

export interface HistoricalExcludeProps {
  time: ProfileTime;
  children: JSX.Children;
}

export const HistoricalExclude = ({ time, children }: HistoricalExcludeProps) => (
  <If condition={time === "LIVE"}>{children}</If>
);
