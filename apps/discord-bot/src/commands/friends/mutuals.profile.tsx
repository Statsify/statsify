/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, HeaderNametag, List, Skin } from "#components";
import { Friend } from "@statsify/schemas";
import { relativeTime } from "@statsify/util";
import type { BaseProfileProps } from "../base.hypixel-command.js";
import type { Image } from "skia-canvas";

export type Mutual = Omit<Friend, "createdAt"> & {
  createdAtOne: number;
  createdAtTwo: number;
};

export interface MutualsProfileProps
  extends Omit<BaseProfileProps, "player" | "time" | "skin" | "badge"> {
  friends: Mutual[];
  friendCount: number;
  displayNameOne: string;
  displayNameTwo: string;
  skinOne: Image;
  skinTwo: Image;
  badgeOne?: Image;
  badgeTwo?: Image;
}

export const MutualsProfile = ({
  background,
  displayNameOne,
  displayNameTwo,
  friends,
  friendCount,
  logo,
  skinOne,
  skinTwo,
  badgeOne,
  badgeTwo,
  t,
  user,
}: MutualsProfileProps) => (
  <Container background={background}>
    <div width="100%">
      <Skin skin={skinOne} />
      <div width="remaining" height="100%" direction="column">
        <div width="100%">
          <div width="50%">
            <HeaderNametag name={displayNameOne} badge={badgeOne} size={3} />
          </div>
          <div width="50%">
            <HeaderNametag name={displayNameTwo} badge={badgeTwo} size={3} />
          </div>
        </div>
        <box width="100%" height="remaining">
          <text>§l§d{t(friendCount)} Mutual Friends</text>
        </box>
      </div>
      <Skin skin={skinTwo} />
    </div>
    <List
      items={friends.map((friend) => (
        <>
          <box width="100%">
            <text>{relativeTime(friend.createdAtOne)}</text>
          </box>
          <box width="remaining" direction="column">
            <text>{friend.displayName}</text>
          </box>

          <box width="100%">
            <text>{relativeTime(friend.createdAtTwo)}</text>
          </box>
        </>
      ))}
    />
    <Footer logo={logo} user={user} />
  </Container>
);
