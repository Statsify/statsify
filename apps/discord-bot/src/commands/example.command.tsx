import { Command, CommandContext } from '@statsify/discord';
import { FontRenderer, JSX } from '@statsify/jsx';
import { BaseThemeContext, IntrinsicRenders } from '@statsify/jsx/src/jsx';
import { Canvas, loadImage } from 'canvas';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import Container from 'typedi';
import { Header, Table } from '../components';

@Command({
  description: 'Displays this message.',
  args: [
    {
      name: 'theme',
      description: 'The theme to use',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Default', value: 'default' },
        { name: 'Faithful', value: 'faithful' },
      ],
    },
  ],
  cooldown: 5,
})
export class ExampleCommand {
  public async run(context: CommandContext) {
    const theme = context.option<string>('theme');

    const player = {
      prefixName: '§6WWWWWWWWWWWWWWWWWW',
      uuid: '96f645ba026b4e45bc34dd8f0531334c',
    };

    const level = `§b[17Ω]`;

    const stats = {
      wins: `${(2985).toLocaleString()}`,
      kills: (25879).toLocaleString(),
      deaths: (9666).toLocaleString(),
      losses: (9337).toLocaleString(),
      assists: (3039).toLocaleString(),
      playtime: '11d 4h',
      kdr: (2.68).toLocaleString(),
      wlr: (0.32).toLocaleString(),
    };

    const mode = 'Overall';

    const skin = await loadImage(`https://visage.surgeplay.com/full/${player.uuid}.png`);

    const width = 860;
    const height = 600;

    const containerWidth = width * 0.95;
    const containerHeight = height * 0.9;

    const Profile = () => (
      <div width="100%" height="100%">
        <div direction="column" width={containerWidth} height={containerHeight} align="center">
          <Header
            skin={skin}
            sidebar={[
              ['Coins', '4,783,624', '§6'],
              ['Loot Chests', '188', '§e'],
              ['Tokens', '1,210,000', '§a'],
              ['Souls', '21,026', '§b'],
              ['Heads', '2,367', '§d'],
              ['Shards', '17,981', '§3'],
              ['Opals', '1', '§9'],
            ]}
            width={containerWidth}
            gameTitle={`§l§bSky§eWars §fStats §r§o(${mode})`}
            playerName={player.prefixName}
            playerDescription={`§bSky§eWars §7Level: ${level}\n§7Progress: §b2,222§7/§a10,000\n${level} §8[§b■■■■■■§7■■■■§8] ${level}`}
          />
          <Table
            rows={[
              {
                data: [
                  ['Kills', stats.kills],
                  ['Wins §^2^§8[§7#§f16k§8]', stats.wins],
                ],
                color: '§a',
              },
              {
                data: [
                  ['Deaths', stats.deaths],
                  ['Losses', stats.losses],
                ],
                color: '§c',
              },
              {
                data: [
                  ['Assists', stats.assists],
                  ['Playtime', stats.playtime],
                ],
                color: '§e',
              },
              {
                data: [
                  ['KDR', stats.kdr],
                  ['WLR', stats.wlr],
                ],
                color: '§6',
              },
            ]}
          />
        </div>
      </div>
    );

    const canvas = new Canvas(width, height);

    const instructions = JSX.createInstructions(
      <Profile />,
      canvas.width,
      canvas.height,
      this.getThemeRenders(theme)
    );

    const buffer = JSX.createRender(canvas, instructions, this.getThemeContext(theme)).toBuffer();

    return {
      files: [{ name: 'example.png', data: buffer, type: 'image/png' }],
    };
  }

  private getThemeContext(theme: string): BaseThemeContext {
    if (theme === 'default') {
      return {
        renderer: Container.get(FontRenderer),
      };
    }

    return {
      renderer: Container.get('HD_RENDERER'),
    };
  }

  private getThemeRenders(theme: string): Partial<IntrinsicRenders> {
    if (theme === 'default') {
      return {};
    }

    return {
      div: (ctx, _, { x, y, width, height }) => {
        ctx.fillRect(x, y, width, height);
      },
    };
  }
}
