import { JSX } from '@statsify/jsx';
import { Image } from 'canvas';
import { Sidebar, SidebarItem } from '../Sidebar';
import { Skin } from '../Skin';
import { HeaderNametag } from './HeaderNametag';
import { SidebarHeader } from './SidebarHeader';
import { SidebarlessHeader } from './SidebarlessHeader';

export interface HeaderProps {
  skin: Image;
  name: string;
  body: (height?: number) => JSX.ElementNode;
  sidebar?: SidebarItem[];
  width: number;
}

export const Header: JSX.FC<HeaderProps> = ({
  name,
  skin: skinImage,
  sidebar: sidebarItems = [],
  body,
  width,
}) => {
  const skin = <Skin skin={skinImage} />;

  const nameTag = <HeaderNametag name={name} />;

  if (sidebarItems.length) {
    const sidebar = <Sidebar items={sidebarItems} />;

    return (
      <SidebarHeader width={width} sidebar={sidebar} skin={skin} bodyEl={body} name={nameTag} />
    );
  }

  return <SidebarlessHeader width={width} skin={skin} body={body()} name={nameTag} />;
};
