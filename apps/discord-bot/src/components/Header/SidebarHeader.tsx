import { JSX, useComponentHeight } from '@statsify/rendering';

export interface SidebarHeaderProps {
  skin: JSX.ElementNode;
  body: JSX.ElementNode;
  sidebar: JSX.ElementNode;
}

export const SidebarHeader: JSX.FC<SidebarHeaderProps> = ({ skin, sidebar, body }) => {
  const bodyHeight = useComponentHeight(body);
  const sidebarHeight = useComponentHeight(sidebar);
  const headerHeight = Math.max(bodyHeight, sidebarHeight);

  return (
    <div height={headerHeight}>
      {skin}
      {body}
      {sidebar}
    </div>
  );
};
