import { JSX, useComponentHeight, useComponentWidth } from '@statsify/jsx';
import type { Image } from 'canvas';
import { Skin } from '../Skin';

export interface SidebarHeaderProps {
  skin: Image;
  bodyEl: (height?: number) => JSX.ElementNode;
  sidebar: JSX.ElementNode;
  name: JSX.ElementNode;
  width: number;
}

export const SidebarHeader: JSX.FC<SidebarHeaderProps> = ({
  name,
  skin: skinImage,
  sidebar,
  bodyEl,
  width,
}) => {
  let body = bodyEl();

  const bodyHeight = useComponentHeight(body) - 8;
  const sidebarHeight = useComponentHeight(sidebar) - 8;

  let headerHeight: number;

  if (bodyHeight > sidebarHeight) {
    headerHeight = bodyHeight;
    sidebar.y.size = headerHeight;
  } else {
    headerHeight = sidebarHeight;

    const nameHeight = useComponentHeight(name);
    body = bodyEl(headerHeight - nameHeight);
  }

  const skin = <Skin skin={skinImage} height={headerHeight} />;

  const inner = (
    <div direction="column">
      {name}
      {body}
    </div>
  );

  inner.x.size = width - useComponentWidth(sidebar) - useComponentWidth(skin);

  return (
    <div>
      {skin}
      {inner}
      {sidebar}
    </div>
  );
};
