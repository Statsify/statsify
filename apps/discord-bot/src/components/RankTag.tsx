/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface RankTagProps {
  rank: string;
  size?: number;
}

export const RankTag = ({ rank, size = 1.75 }: RankTagProps) => (
  <box
    padding={{ top: 3, bottom: 3, left: 8, right: 8 }}
    margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
    border={{ topLeft: 3, topRight: 3, bottomLeft: 3, bottomRight: 3 }}
    color="rgba(255, 255, 255, 0.12)"
    shadowDistance={2}
    shadowOpacity={0.45}
  >
    <text margin={0} size={size}>{rank}</text>
  </box>
);
