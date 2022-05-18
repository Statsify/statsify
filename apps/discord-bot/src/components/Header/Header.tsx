import { JSX, useChildren } from '@statsify/jsx';
import { Image } from 'skia-canvas';
import { Sidebar, SidebarItem } from '../Sidebar';
import { HeaderNametag } from './HeaderNametag';
import { SidebarHeader } from './SidebarHeader';
import { SidebarlessHeader } from './SidebarlessHeader';

export interface HeaderProps {
  skin: Image;
  name: string;
  children: JSX.Children<(height?: number) => JSX.ElementNode>;
  sidebar?: SidebarItem[];
  width: number;
}

export const Header: JSX.FC<HeaderProps> = ({
  name,
  skin,
  sidebar: sidebarItems = [],
  children,
  width,
}) => {
  const nameTag = <HeaderNametag name={name} />;
  const [headerBody] = useChildren(children);

  if (sidebarItems.length) {
    const sidebar = <Sidebar items={sidebarItems} />;

    return (
      <SidebarHeader
        width={width}
        sidebar={sidebar}
        skin={skin}
        bodyEl={headerBody}
        name={nameTag}
      />
    );
  }

  return <SidebarlessHeader width={width} skin={skin} body={headerBody()} name={nameTag} />;
};
