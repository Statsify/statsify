import { JSX, useComponentHeight, useComponentWidth } from '@statsify/jsx';

export interface SidebarHeaderProps {
  skin: JSX.ElementNode;
  body: JSX.ElementNode;
  name: JSX.ElementNode;
  width: number;
}

export const SidebarlessHeader: JSX.FC<SidebarHeaderProps> = ({ name, skin, body, width }) => {
  const headerHeight = useComponentHeight(name) + useComponentHeight(body) - 8;
  skin.y.size = headerHeight;

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
