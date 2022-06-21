/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "./Background";
import { Image } from "skia-canvas";
import { Percent } from "@statsify/rendering";

export interface ContainerProps {
  /**
   * @default 97
   * @description The percent size of the container. The number should be 1-100.
   */
  percent?: Percent;

  background?: Image;

  children: JSX.Children;
}

export const Container = ({ background, percent = "97%", children }: ContainerProps) => {
  const inner = (
    <div direction="column" width={percent} height={percent} align="center">
      {children}
    </div>
  );

  if (background) {
    return <Background background={background}>{inner}</Background>;
  }

  return (
    <div width="100%" height="100%">
      {inner}
    </div>
  );
};
