/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/future/image";

export interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo = ({ width = 350, height = 150 }: LogoProps) => (
  <Image src="/logo.svg" width={width} height={height} />
);
