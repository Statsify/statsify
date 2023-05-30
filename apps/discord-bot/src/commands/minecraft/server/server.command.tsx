/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import axios, { AxiosInstance } from "axios";
import { Command, CommandContext, ErrorMessage, IMessage } from "@statsify/discord";
import { Server } from "./server.interface";
import { ServerArgument } from "./server.argument";
import { ServerMappingsServer, getBackground, getServerMappings } from "@statsify/assets";
import { ServerProfile } from "./server.profile";
import { getTheme } from "#themes";
import { loadImage } from "skia-canvas";
import { render } from "@statsify/rendering";

@Command({
  description: (t) => t("commands.server"),
  args: [ServerArgument],
})
export class ServerCommand {
  private readonly axios: AxiosInstance;
  private mappings: ServerMappingsServer[];

  public constructor() {
    this.axios = axios.create({
      baseURL: "https://api.mcsrvstat.us/2/",
    });

    getServerMappings().then((mappings) => {
      this.mappings = mappings;
    });
  }

  public async run(context: CommandContext): Promise<IMessage> {
    const t = context.t();
    const user = context.getUser();

    const server = await this.getServer(context.option<string>("server"));

    const [serverLogo, background] = await Promise.all([
      loadImage(server.icon),
      getBackground("minecraft", "overall"),
    ]);

    const canvas = render(
      <ServerProfile
        background={background}
        server={server}
        serverLogo={serverLogo}
        t={t}
      />,
      getTheme(user)
    );

    const buffer = await canvas.toBuffer("png");

    return { files: [{ name: "server.png", data: buffer, type: "image/png" }] };
  }

  private async getServer(tag: string) {
    tag = tag.toLowerCase();

    const mappedServer = this.mappings.find(
      (s) =>
        s.name.toLowerCase() === tag ||
        s.addresses.find((address) => tag.endsWith(address))
    );

    const server = await this.axios
      .get<Server>(mappedServer?.primaryAddress ?? tag)
      .then((res) => res.data)
      .catch(() => null);

    if (!server || !server.online) throw new ErrorMessage("errors.invalidServer");

    server.hostname = mappedServer?.primaryAddress ?? server.hostname;
    server.name = mappedServer?.name ?? server.hostname;

    return server;
  }
}
