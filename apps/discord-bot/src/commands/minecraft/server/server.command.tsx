/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import axios, { AxiosInstance } from "axios";
import { Command, CommandContext, ErrorMessage, IMessage } from "@statsify/discord";
import { Container, Multiline } from "#components";
import { ServerArgument } from "./server.argument";
import { getBackground, getServerMappings } from "@statsify/assets";
import { loadImage } from "skia-canvas";
import { render } from "@statsify/rendering";

const servers = getServerMappings();

interface Server {
  ip: string;
  port: number;
  debug: {
    ping: boolean;
    query: boolean;
    srv: boolean;
    querymismatch: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachetime: number;
    apiversion: number;
  };
  motd: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  players: {
    online: number;
    max: number;
  };
  version?: string;
  online: boolean;
  protocol: number;
  hostname: string;
  name: string;
  icon: string;
  ping: number;
}

@Command({
  description: (t) => t("commands.server"),
  args: [ServerArgument],
})
export class ServerCommand {
  private readonly axios: AxiosInstance;

  public constructor() {
    this.axios = axios.create({
      baseURL: "https://api.mcsrvstat.us/2/",
    });
  }

  public async run(context: CommandContext): Promise<IMessage> {
    const t = context.t();

    const server = await this.getServer(context.option<string>("server"));

    const [serverLogo, background] = await Promise.all([
      loadImage(server.icon),
      getBackground("minecraft", "overall"),
    ]);

    const canvas = render(
      <Container background={background}>
        <box direction="column" width="100%">
          <text>
            §l{server.name}§r - §b{server.hostname}
          </text>
        </box>
        <div width="100%">
          <box>
            <img margin={8} image={serverLogo} />
          </box>
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

    const buffer = await canvas.toBuffer("png");

    return { files: [{ name: "server.png", data: buffer, type: "image/png" }] };
  }

  private async getServer(tag: string) {
    tag = tag.toLowerCase();

    const mappedServer = servers.find(
      (s) =>
        s.name.toLowerCase() === tag ||
        s.addresses.find((address) => tag.endsWith(address))
    );

    const server = await this.axios
      .get<Server>(mappedServer?.addresses?.[0] ?? tag)
      .then((res) => res.data)
      .catch(() => null);

    if (!server || !server.online) throw new ErrorMessage("errors.invalidServer");

    server.hostname = mappedServer?.addresses?.[0] ?? server.hostname;
    server.name = mappedServer?.name ?? server.hostname;

    return server;
  }
}
