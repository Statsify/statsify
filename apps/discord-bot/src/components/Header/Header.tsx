import { JSX } from '@statsify/rendering';
import { Image } from 'skia-canvas';
import { Sidebar, SidebarItem } from '../Sidebar';
import { Skin } from '../Skin';
import { HeaderNametag } from './HeaderNametag';
import { SidebarHeader } from './SidebarHeader';
import { SidebarlessHeader } from './SidebarlessHeader';

interface SidebarlessHeaderProps {
  skin: Image;
  badge?: Image;
  size?: number;
  name: string;
  children: JSX.ElementNode;
}

interface SidebarHeaderProps extends SidebarlessHeaderProps {
  sidebar: SidebarItem[];
}

export type HeaderProps = SidebarHeaderProps | SidebarlessHeaderProps;

/**
 *
 * @example With sidebar
 * ```ts
 * const skin = new Image();
 * const player = { prefixName: "j4cobi" };
 * const sidebar: SidebarItem = [
 *  ['Item', '10', '§a'],
 *  ['Item', '10', '§a'],
 *  ['Item', '10', '§a'],
 * ];
 *
 * <Header skin={skin} name={player.prefixName} sidebar={sidebar}>
 *  <HeaderBody title="Title" description="Description" height={height} />
 * </Header>
 * ```
 * @example Sidebarless
 * ```ts
 * const skin = new Image();
 * const player = { prefixName: "j4cobi" };
 *
 * <Header skin={skin} name={player.prefixName}>
 *  <HeaderBody title="Title" description="Description"/>
 * </Header>
 * ```
 */
export const Header: JSX.FC<HeaderProps> = (props) => {
  const body = (
    <div direction="column" width="remaining" height="100%">
      <HeaderNametag name={props.name} badge={props.badge} size={props.size} />
      {props.children}
    </div>
  );

  const skin = <Skin skin={props.skin} />;

  if ('sidebar' in props && props.sidebar.length) {
    const sidebar = <Sidebar items={props.sidebar} />;
    return <SidebarHeader sidebar={sidebar} skin={skin} body={body} />;
  }

  return <SidebarlessHeader skin={skin} body={body} />;
};
