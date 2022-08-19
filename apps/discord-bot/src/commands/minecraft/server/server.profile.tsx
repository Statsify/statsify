/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Multiline } from "#components";
import type { Image } from "skia-canvas/lib";
import type { LocalizeFunction } from "@statsify/discord";
import type { Server } from "./server.interface";

interface ServerLogoProps {
  serverLogo: Image;
}

//Required for theming
const ServerLogo = ({ serverLogo }: ServerLogoProps) => (
  <box>
    <img margin={8} image={serverLogo} />
  </box>
);

export interface ServerProfileProps extends ServerLogoProps {
  background: Image;
  server: Server;
  t: LocalizeFunction;
}

export const ServerProfile = ({
  background,
  server,
  serverLogo,
  t,
}: ServerProfileProps) => (
  <Container background={background}>
    <box direction="column" width="100%">
      <text>
        §l{server.name}§r - §b{server.hostname}
      </text>
    </box>
    <div width="100%">
      <ServerLogo serverLogo={serverLogo} />
      <box
        width="remaining"
        height="100%"
        padding={{ left: 8, right: 4, top: 4, bottom: 4 }}
      >
        <div height="100%" direction="column">
          <Multiline margin={2}>
            {server.motd.raw.map((m) => m.replace(/\s{2,}/g, "")).join("\n")}
          </Multiline>
        </div>
      </box>
    </div>
    <box width="100%" direction="column">
      <text>{`§a${t(server.players.online)}§8/§7${t(server.players.max)}`}</text>
    </box>
  </Container>
);
