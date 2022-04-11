import { Command } from '@statsify/discord';
import { FontRenderer, JSX } from '@statsify/jsx';
import { loadImage } from 'canvas';
import { Header, Table } from '../components';

@Command({
  description: 'Displays this message.',
  args: [],
  cooldown: 5,
})
export class ExampleCommand {
  public async run() {
    const renderer = new FontRenderer();
    await renderer.loadImages();

    const player = {
      prefixName: '§6Amony',
      uuid: '96f645ba026b4e45bc34dd8f0531334c',
    };

    const level = `§b[17Ω]`;

    const stats = {
      wins: (2985).toLocaleString(),
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

    const width = 900;
    const height = 600;

    const containerWidth = width * 0.9;
    const containerHeight = height * 0.9;

    const profile = (
      <div width="100%" height="100%">
        <div direction="column" width={containerWidth} height={containerHeight} align="center">
          <Header
            renderer={renderer}
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
            renderer={renderer}
            rows={[
              {
                data: [
                  ['Kills', stats.kills],
                  ['Wins', stats.wins],
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

    const canvas = JSX.createRender(profile, width, height);

    const buffer = canvas.toBuffer();

    return {
      files: [{ name: 'example.png', data: buffer, type: 'image/png' }],
      content: 'hello',
    };
  }
}
