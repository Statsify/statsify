/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import { Container, Footer, Header, List } from "#components";
import { Friend } from "@statsify/schemas";
import { relativeTime } from "@statsify/util";
import type { Image } from "skia-canvas";

export type FriendWithSkin = Friend & {
  skin: Image;
};

export interface FriendsProfileProps extends Omit<BaseProfileProps, "player" | "time"> {
  friends: FriendWithSkin[];
  friendCount: number;
  displayName: string;
}

export const FriendsProfile = ({
  displayName,
  skin,
  background,
  friends,
  friendCount,
  badge,
  logo,
  tier,
  t,
}: FriendsProfileProps) => (
  <Container background={background}>
    <Header
      name={displayName}
      skin={skin}
      time="LIVE"
      title={`§l§d${t(friendCount)} Friends`}
      badge={badge}
      size={3}
    />
    <List
      items={friends.map((friend) => (
        <>
          <box width="100%" padding={{ left: 12, right: 12, top: 4, bottom: 4 }}>
            <img image={friend.skin} width={24} height={24} />
          </box>
          <box width="remaining" direction="column">
            <text align="left">{friend.displayName}</text>
          </box>
          <box width="100%">
            <text>{relativeTime(friend.createdAt)}</text>
          </box>
        </>
      ))}
    />
    <Footer logo={logo} tier={tier} />
  </Container>
);
