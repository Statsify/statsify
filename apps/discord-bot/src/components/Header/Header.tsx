/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DateTime } from "luxon";
import { HeaderBody } from "./HeaderBody";
import { HeaderNametag } from "./HeaderNametag";
import { Historical } from "../Historical";
import { HistoricalTimeData } from "../Historical/Historical-Header";
import { Image } from "skia-canvas";
import { Sidebar, SidebarItem } from "../Sidebar";
import { Skin } from "../Skin";
import { fisherYates } from "@statsify/util";
import { useChildren } from "@statsify/rendering";

interface BaseHeaderProps {
  skin: Image;
  badge?: Image;
  size?: number;
  name: string;
  time: "LIVE" | HistoricalTimeData;
  startTime?: DateTime;
  endTime?: DateTime;
  title: string;

  historicalSidebar?: boolean;
}

interface SidebarlessHeaderProps extends BaseHeaderProps {
  description?: string;
}

interface SidebarHeaderProps extends SidebarlessHeaderProps {
  sidebar: SidebarItem[];
}

interface CustomHeaderBodyProps extends BaseHeaderProps {
  children: JSX.Children;
}

export type HeaderProps =
  | SidebarlessHeaderProps
  | SidebarHeaderProps
  | CustomHeaderBodyProps;

export const Header = (props: HeaderProps) => {
  const skin = <Skin skin={props.skin} />;
  const nameTag = (
    <HeaderNametag name={props.name} badge={props.badge} size={props.size} />
  );

  const sidebar =
    "sidebar" in props &&
    props.sidebar.length &&
    (props.time === "LIVE" ? true : props.historicalSidebar) ? (
      <Sidebar items={props.sidebar} />
    ) : (
      <></>
    );

  let body: JSX.Element;

  if ("children" in props) {
    const children = useChildren(props.children);
    body = <>{children}</>;
  } else {
    body = <HeaderBody title={props.title} description={props.description} />;
  }

  if (props.time !== "LIVE")
    return (
      <Historical.header
        nameTag={nameTag}
        skin={skin}
        title={props.title}
        time={props.time}
        sidebar={sidebar}
      />
    );

  const nameArea = (
    <div direction="column" width="remaining" height="100%">
      {fisherYates([nameTag, body])}
    </div>
  );

  return <div width="100%">{fisherYates([nameArea, skin, sidebar])}</div>;
};
