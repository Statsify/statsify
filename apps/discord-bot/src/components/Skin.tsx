import { JSX } from '@statsify/rendering';
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
 *
 * @example
 * ```ts
 * const skin = new Image();
 * <Skin skin={skin} height={120} />
 * ```
 */
export const Skin: JSX.FC<SkinProps> = ({ skin }) => {
  const width = 125;

  return (
    <box width={width} height="remaining">
      <img image={skin} height="100%" crop="resize" />
    </box>
  );
};
