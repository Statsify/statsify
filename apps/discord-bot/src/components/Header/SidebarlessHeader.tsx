import { JSX, useComponentHeight } from '@statsify/rendering';

export interface SidebarHeaderProps {
  skin: JSX.ElementNode;
  body: JSX.ElementNode;
}

export const SidebarlessHeader: JSX.FC<SidebarHeaderProps> = ({ skin, body }) => {
  const headerHeight = useComponentHeight(body);

  return (
    <div width="100%" height={headerHeight}>
      {skin}
      {body}
    </div>
  );
};
