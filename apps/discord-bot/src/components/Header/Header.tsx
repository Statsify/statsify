/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DateTime } from "luxon";
import { HeaderBody } from "./HeaderBody.js";
import { HeaderNametag } from "./HeaderNametag.js";
import { Historical, type HistoricalTimeData } from "../Historical/index.js";
import { Image } from "skia-canvas";
import { Sidebar, SidebarItem } from "../Sidebar.js";
import { Skin } from "../Skin.js";
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
  | SidebarlessHeaderProps |
  SidebarHeaderProps |
  CustomHeaderBodyProps;

export const Header = (props: HeaderProps) => {
  const skin = <Skin skin={props.skin} />;
  const nameTag = (
    <HeaderNametag name={props.name} badge={props.badge} size={props.size} />
  );

  const sidebar =
    "sidebar" in props &&
    props.sidebar.length &&
    (props.time === "LIVE" ? true : props.historicalSidebar) ?
      <Sidebar items={props.sidebar} /> :
      <></>;

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

  return (
    <div width="100%">
      {skin}
      <div direction="column" width="remaining" height="100%">
        {nameTag}
        {body}
      </div>
      {sidebar}
    </div>
  );
};
