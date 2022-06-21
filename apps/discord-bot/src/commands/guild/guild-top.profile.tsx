/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, List } from "#components";
import { Guild, UserTier } from "@statsify/schemas";
import { Image } from "skia-canvas";
import { LocalizeFunction } from "@statsify/discord";
import { arrayGroup } from "@statsify/util";

export interface GuildTopMember {
  name: string;
  value: number;
}

export interface GuildTopProfileProps {
  guild: Guild;
  members: GuildTopMember[];
  page: number;
  title: string;
  t: LocalizeFunction;
  background: Image;
  logo: Image;
  tier?: UserTier;
}

export const GUILD_TOP_PAGE_SIZE = 30;

export const GuildTopProfile = ({
  guild,
  members,
  title,
  page,
  t,
  background,
  tier,
  logo,
}: GuildTopProfileProps) => {
  const groups = arrayGroup(members, Math.ceil(members.length / 2));
  const indexOffset = page * GUILD_TOP_PAGE_SIZE + 1;

  const lists = groups.map((members, i) => (
    <List
      width={`1/${groups.length}`}
      items={members.map((member, index) => (
        <>
          <box border={{ bottomLeft: 4, topLeft: 4, bottomRight: 0, topRight: 0 }}>
            <text>#§l{t(indexOffset + index + (groups[i - 1]?.length ?? 0))}</text>
          </box>
          <box
            width="remaining"
            border={{ bottomLeft: 0, topLeft: 0, bottomRight: 0, topRight: 0 }}
            direction="column"
          >
            <text align="left">{member.name}</text>
          </box>
          <box
            padding={{ left: 4, right: 4 }}
            border={{ bottomLeft: 0, topLeft: 0, bottomRight: 4, topRight: 4 }}
          >
            <text>{t(member.value)}</text>
          </box>
        </>
      ))}
    />
  ));

  return (
    <Container background={background}>
      <box width="100%">
        <text>§^4^{guild.nameFormatted}</text>
      </box>
      <box width="100%">
        <text>§l§2GEXP for {title}</text>
      </box>
      <div width="100%">{lists}</div>
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
