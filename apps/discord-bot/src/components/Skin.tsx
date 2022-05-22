import { JSX } from '@statsify/rendering';
import { Image } from 'skia-canvas';

export interface SkinProps {
  skin: Image;
  height?: number;
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
export const Skin: JSX.FC<SkinProps> = ({ skin, height }) => {
  const width = 125;
  const scale = skin.width / width;

  return (
    <box width={width} height={height ?? width}>
      <img
        image={skin}
        crop={[0, 0, skin.width, height ? Math.round(height * scale) : skin.width]}
      />
    </box>
  );
};
