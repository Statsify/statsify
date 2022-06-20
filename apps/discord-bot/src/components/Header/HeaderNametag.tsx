/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Canvas, Image } from 'skia-canvas';
import { If } from '../If';

export interface HeaderNametagProps {
  name: string;
  badge?: Image | Canvas;
  size?: number;
}

export const HeaderNametag = ({ name, badge, size = 4 }: HeaderNametagProps) => {
  return (
    <box width="100%">
      <If condition={badge}>{(badge) => <img margin={{ right: 8 }} image={badge} />}</If>
      <text>
        §^{size}^{name}
      </text>
    </box>
  );
};
