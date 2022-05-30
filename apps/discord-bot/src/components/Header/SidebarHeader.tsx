import { JSX } from '@statsify/rendering';

export interface SidebarHeaderProps {
  skin: JSX.ElementNode;
  body: JSX.ElementNode;
  sidebar: JSX.ElementNode;
}

export const SidebarHeader: JSX.FC<SidebarHeaderProps> = ({ skin, sidebar, body }) => {
  return (
    <div width="100%">
      {skin}
      {body}
      {sidebar}
    </div>
  );
};
