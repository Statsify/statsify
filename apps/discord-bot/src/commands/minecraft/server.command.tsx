import { TextArgument } from '#arguments';
import { Container, ProgressBar } from '#components';
import { getBackground } from '@statsify/assets';
import { Command, CommandContext, IMessage } from '@statsify/discord';
import { render } from '@statsify/rendering';
import axios, { AxiosInstance } from 'axios';
import { loadImage } from 'skia-canvas/lib';
import servers from '../../../../../assets/server-mappings/servers.json';
import { ErrorMessage } from '../../error.message';

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
  description: (t) => t('commands.server'),
  args: [new TextArgument('server', (t) => t('arguments.server'), true)],
})
export class ServerCommand {
  private readonly axios: AxiosInstance;

  public constructor() {
    this.axios = axios.create({
      baseURL: 'https://api.mcsrvstat.us/2/',
    });
  }

  public async run(context: CommandContext): Promise<IMessage> {
    const t = context.t();

    const server = await this.getServer(context.option<string>('server'));

    const [serverLogo, background] = await Promise.all([
      loadImage(server.icon),
      getBackground('bedwars', 'overall'),
    ]);

    const canvas = render(
      <Container background={background}>
        <box width="100%">
          <img margin={8} image={serverLogo} />
          <div direction="column" width="remaining" height="100%">
            <text margin={2}>§l§^3^{server.name}</text>
            <text margin={2}>§b{server.hostname}</text>
          </div>
        </box>
        <box width="100%" direction="column">
          {server.motd.raw.map((m) => (
            <text>{m.trim()}</text>
          ))}
        </box>
        <box width="100%" direction="column">
          <ProgressBar
            numerator={server.players.online}
            denominator={server.players.max}
            color="rgb(59, 164, 93)"
            t={t}
          />
        </box>
      </Container>
    );

    const buffer = await canvas.toBuffer('png');

    return { files: [{ name: 'server.png', data: buffer, type: 'image/png' }] };
  }

  private async getServer(tag: string) {
    tag = tag.toLowerCase();

    const mappedServer = servers.find(
      (s) => s.name.toLowerCase() === tag || s.addresses.find((address) => tag.endsWith(address))
    );

    const server = await this.axios
      .get<Server>(mappedServer?.addresses?.[0] ?? tag)
      .then((res) => res.data)
      .catch(() => null);

    if (!server || !server.online)
      throw new ErrorMessage('errors.invalidServer.title', 'errors.invalidServer.description');

    server.hostname = mappedServer?.addresses?.[0] ?? server.hostname;
    server.name = mappedServer?.name ?? server.hostname;

    return server;
  }
}
