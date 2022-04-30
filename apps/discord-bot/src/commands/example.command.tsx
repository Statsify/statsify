import { Command, CommandContext } from '@statsify/discord';
import { FontRenderer, JSX } from '@statsify/jsx';
import { Canvas, loadImage } from 'canvas';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import Container from 'typedi';
import { Header, HeaderBody, Table } from '../components';
import { ApiService } from '../services/api.service';

@Command({
  description: 'Displays this message.',
  args: [
    {
      name: 'player',
      description: 'The player to get the stats for.',
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  cooldown: 5,
})
export class ExampleCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const player = await this.apiService.getPlayer(context.option('player'), context.user);

    const { skywars } = player.stats;

    const {
      overall: { overall: stats },
      levelFormatted: level,
    } = skywars;

    const skin = await loadImage(`https://visage.surgeplay.com/full/${player.uuid}.png`);

    const width = 860;
    const height = 500;

    const containerWidth = width * 0.95;
    const containerHeight = height * 0.9;

    const Profile = () => (
      <div width="100%" height="100%">
        <div direction="column" width={containerWidth} height={containerHeight} align="center">
          <Header
            skin={skin}
            sidebar={[
              ['Coins', skywars.coins, '§6'],
              ['Loot Chests', skywars.lootChests, '§e'],
              ['Tokens', skywars.tokens, '§a'],
              ['Souls', skywars.souls, '§b'],
              ['Heads', skywars.heads, '§d'],
              ['Shards', skywars.shards, '§3'],
              ['Opals', skywars.opals, '§9'],
            ]}
            body={(height) => (
              <HeaderBody
                height={height}
                description={`§bSky§eWars §7Level: ${level}\n§7Progress: §b2,222§7/§a10,000\n${level} §8[§b■■■■■■§7■■■■§8] ${level}`}
                title="§l§bSky§eWars §fStats §r(§oOverall§r)"
              />
            )}
            width={containerWidth}
            name={player.prefixName}
          />
          <Table
            rows={[
              {
                data: [
                  ['Wins §^2^§8[§7#§f16k§8]', stats.wins],
                  ['Losses', stats.losses],
                  ['WLR', stats.wlr],
                ],
                color: '§a',
              },
              {
                data: [
                  ['Kills', stats.kills],
                  ['Deaths', stats.deaths],
                  ['KDR', stats.kdr],
                ],
                color: '§c',
              },
              {
                data: [
                  ['Assists', stats.assists],
                  ['Playtime', stats.playTime],
                  ['Kit', 'Pyrotechnic'],
                ],
                color: '§e',
              },
            ]}
            width={containerWidth}
          />
        </div>
      </div>
    );

    const canvas = new Canvas(width, height);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, width, height);

    const instructions = JSX.createInstructions(<Profile />, canvas.width, canvas.height);

    const buffer = JSX.createRender(canvas, instructions, {
      renderer: Container.get(FontRenderer),
    }).toBuffer();

    return {
      files: [{ name: 'example.png', data: buffer, type: 'image/png' }],
    };
  }
}
