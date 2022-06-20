/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Canvas, Image } from 'skia-canvas';

export interface BackgroundProps {
  background: Canvas | Image;
  children: JSX.Children;
}

export const Background = ({ background, children }: BackgroundProps) => {
  return (
    <img image={background} width="100%" height="100%">
      {children}
    </img>
  );
};
