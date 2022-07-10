/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, HeaderNametag, Skin } from "#components";
import type { Canvas, Image } from "skia-canvas";
import type { Player, UserTier } from "@statsify/schemas";

export interface DemoProfileProps {
  background: Image;
  logo: Image;
  skin: Image;
  player: Player;
  tier?: UserTier;
  badge?: Image | Canvas;
  message: string;
}

export const DemoProfile = ({
  background,
  skin,
  player,
  badge,
  tier,
  logo,
  message,
}: DemoProfileProps) => (
  <Container background={background}>
    <div width="100%">
      <Skin skin={skin} />
      <div direction="column" width="remaining" height="100%">
        <HeaderNametag name={player.prefixName} badge={badge} />
        <box width="100%">
          <text>{message}</text>
        </box>
        <Footer logo={logo} tier={tier}></Footer>
      </div>
    </div>
  </Container>
);
