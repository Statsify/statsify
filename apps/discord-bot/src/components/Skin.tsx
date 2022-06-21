/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Image } from 'skia-canvas';

export interface SkinProps {
  skin: Image;
}

/**
 *
 * @example
 * ```ts
 * const skin = new Image();
 * <Skin skin={skin}/>
 * ```
 */
export const Skin = ({ skin }: SkinProps) => {
  const width = 125;

  return (
    <box height="100%" padding={0}>
      <img image={skin} width={width} height="100%" crop="height-crop" />
    </box>
  );
};
