import { Command, CommandContext } from '@statsify/discord';
import { JSX } from '@statsify/jsx';
import { Canvas, loadImage } from 'canvas';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { Header, Table } from '../components';
import { ApiService } from '../services/api.service';

@Command({
  description: 'Displays this message.',
  args: [
    {
      name: 'player',
      description: 'The player to get the stats for.',
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  cooldown: 5,
})
export class ExampleCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const tag = context.option<string>('player');
    const player = await this.apiService.getPlayer(tag);

    const { skywars } = player.stats;
    const mode = 'overall';
    const stats = skywars[mode].overall;

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
              ['Coins', skywars.coins, '§6'],
              ['Loot Chests', skywars.lootChests, '§e'],
              ['Tokens', skywars.tokens, '§a'],
              ['Souls', skywars.souls, '§b'],
              ['Heads', skywars.heads, '§d'],
              ['Shards', skywars.shards, '§3'],
              ['Opals', skywars.opals, '§9'],
            ]}
            width={containerWidth}
            gameTitle={`§l§bSky§eWars §fStats §r§o(${mode})`}
            playerName={player.prefixName}
            playerDescription={`§bSky§eWars §7Level: ${skywars.levelFormatted}\n§7Progress: §b2,222§7/§a10,000\n${skywars.levelFormatted} §8[§b■■■■■■§7■■■■§8] ${skywars.levelFormatted}`}
          />
          <Table
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
                  ['Playtime', stats.playTime],
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

    const instructions = JSX.createInstructions(<Profile />, canvas.width, canvas.height);
    const buffer = JSX.createRender(canvas, instructions).toBuffer();

    return {
      files: [{ name: 'example.png', data: buffer, type: 'image/png' }],
    };
  }
}
