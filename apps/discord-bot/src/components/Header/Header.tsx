import { useChildren } from '@statsify/rendering';
import { Image } from 'skia-canvas';
import { Sidebar, SidebarItem } from '../Sidebar';
import { Skin } from '../Skin';
import { HeaderBody } from './HeaderBody';
import { HeaderNametag } from './HeaderNametag';

interface BaseHeaderProps {
  skin: Image;
  badge?: Image;
  size?: number;
  name: string;
}

interface SidebarlessHeaderProps extends BaseHeaderProps {
  title: string;
  description?: string;
}

interface SidebarHeaderProps extends SidebarlessHeaderProps {
  sidebar: SidebarItem[];
}

interface CustomHeaderBodyProps extends BaseHeaderProps {
  children: JSX.Children;
}

export type HeaderProps = SidebarlessHeaderProps | SidebarHeaderProps | CustomHeaderBodyProps;

export const Header = (props: HeaderProps) => {
  const skin = <Skin skin={props.skin} />;

  const sidebar =
    'sidebar' in props && props.sidebar.length ? <Sidebar items={props.sidebar} /> : <></>;

  let body: JSX.Element;

  if ('title' in props) {
    body = <HeaderBody title={props.title} description={props.description} />;
  } else if ('children' in props) {
    const children = useChildren(props.children);
    body = <>{children}</>;
  } else {
    throw new Error('Invalid header props, could not determine body');
  }

  return (
    <div width="100%">
      {skin}
      <div direction="column" width="remaining" height="100%">
        <HeaderNametag name={props.name} badge={props.badge} size={props.size} />
        {body}
      </div>
      {sidebar}
    </div>
  );
};
