/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ApiSettings } from "@statsify/skyblock";
import type { LocalizeFunction } from "@statsify/discord";

export interface EmptySectionProps {
  setting: keyof ApiSettings;
  t: LocalizeFunction;
}

export const EmptySection = ({ setting, t }: EmptySectionProps) => (
  <box width="100%">
    <text>{`§c${t("skyblock.apiOffCard", { setting: t(`skyblock.apiSettings.${setting}`) })}`}</text>
  </box>
);
