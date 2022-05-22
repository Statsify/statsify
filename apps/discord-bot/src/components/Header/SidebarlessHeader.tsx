import { JSX, useComponentHeight, useComponentWidth } from '@statsify/rendering';
import type { Image } from 'skia-canvas';
import { Skin } from '../Skin';

export interface SidebarHeaderProps {
  skin: Image;
  body: JSX.ElementNode;
  name: JSX.ElementNode;
  width: number;
}

export const SidebarlessHeader: JSX.FC<SidebarHeaderProps> = ({
  name,
  skin: skinImage,
  body,
  width,
}) => {
  const headerHeight = useComponentHeight(name) + useComponentHeight(body) - 8;

  const skin = <Skin skin={skinImage} height={headerHeight} />;

  const bodyWidth = width - useComponentWidth(skin);

  return (
    <div>
      {skin}
      <div width={bodyWidth} direction="column">
        {name}
        {body}
      </div>
    </div>
  );
};
