/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface BadgeProps {
  children: string;
  color?: JSX.IntrinsicElements["box"]["color"];
  outline?: JSX.IntrinsicElements["box"]["outline"];
}

export const Badge = ({
  children,
  color = "rgba(255, 255, 255, 0.14)",
  outline,
}: BadgeProps) => (
  <box
    padding={{ top: 3, bottom: 3, left: 8, right: 8 }}
    margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
    border={{ topLeft: 3, topRight: 3, bottomLeft: 3, bottomRight: 3 }}
    color={color}
    outline={outline}
    outlineSize={2}
    shadowDistance={2}
    shadowOpacity={0.45}
  >
    <text margin={0} size={1.5}>{children}</text>
  </box>
);
