/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface EmptyProps {
  text: string;
  color?: string;
}

export const Empty = ({ text, color = "§7" }: EmptyProps) => (
  <box width="100%">
    <text>{`${color}${text}`}</text>
  </box>
);
