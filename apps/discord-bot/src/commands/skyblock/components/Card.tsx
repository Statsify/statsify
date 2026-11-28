/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem } from "#components";
import { Empty } from "./Empty.js";
import type { SkyBlockProfileProps } from "../skyblock.command.js";

export interface CardProps extends Pick<
  SkyBlockProfileProps,
  "title" | "skin" | "badge" | "background" | "logo" | "user"
> {
  name: string;
  sidebar?: SidebarItem[];
  children: JSX.Children;
}

export const Card = ({
  name,
  sidebar = [],
  title,
  skin,
  badge,
  background,
  logo,
  user,
  children,
}: CardProps) => (
  <Container background={background}>
    <Header
      skin={skin}
      name={name}
      badge={badge}
      sidebar={sidebar}
      title={title}
      time="LIVE"
    />
    <>{children}</>
    <Footer logo={logo} user={user} />
  </Container>
);

interface EmptyCardProps extends Omit<CardProps, "children"> {
  text: string;
}

export const EmptyCard = ({ text, ...card }: EmptyCardProps) => (
  <Card {...card}>
    <Empty text={text} />
  </Card>
);
