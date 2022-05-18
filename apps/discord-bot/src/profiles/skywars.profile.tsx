import { JSX } from '@statsify/jsx';
import type { Player, SkyWarsMode } from '@statsify/schemas';
import { formatTime, prettify } from '@statsify/util';
import type { Image } from 'skia-canvas';
import {
  Container,
  formatProgression,
  Header,
  HeaderBody,
  If,
  SidebarItem,
  Table,
} from '../components';

interface SkyWarsModeTableProps {
  modeStats: SkyWarsMode;
  mode: 'overall' | 'insane' | 'normal';
  width?: JSX.Measurement;
}

const SkyWarsModeTable: JSX.FC<SkyWarsModeTableProps> = ({ modeStats, mode, width }) => {
  const stats = modeStats[mode];
  const isOverall = mode === 'overall';
  const size = isOverall ? 'regular' : 'small';

  return (
    <Table.table width={width}>
      <Table.ts title={`§e${prettify(mode)}`}>
        <Table.tr>
          <Table.td title="Wins" value={stats.wins} color="§a" size={size} />
          <Table.td title="Losses" value={stats.losses} color="§c" size={size} />
          <Table.td title="WLR" value={stats.wlr} color="§6" size={size} />
        </Table.tr>
        <Table.tr>
          <Table.td title="Kills" value={stats.kills} color="§a" size={size} />
          <Table.td title="Deaths" value={stats.deaths} color="§c" size={size} />
          <Table.td title="KDR" value={stats.kdr} color="§6" size={size} />
        </Table.tr>
        <If condition={isOverall}>
          <Table.tr>
            <Table.td title="Assists" value={stats.assists} color="§a" size={size} />
            <Table.td title="Playtime" value={formatTime(stats.playTime)} color="§c" size={size} />
            <Table.td title="Kit" value={prettify(stats.kit)} color="§6" size={size} />
          </Table.tr>
        </If>
      </Table.ts>
    </Table.table>
  );
};

export interface SkyWarsProfileProps {
  skin: Image;
  player: Player;
  width: number;
  height: number;
  mode: 'overall' | 'solo' | 'doubles';
}

export const SkyWarsProfile: JSX.FC<SkyWarsProfileProps> = ({
  skin,
  player,
  mode,
  width,
  height,
}) => {
  const skywars = player.stats.skywars;
  const modeStats = skywars[mode];

  const sidebar: SidebarItem[] = [
    ['Coins', skywars.coins, '§6'],
    ['Loot Chests', skywars.lootChests, '§e'],
    ['Tokens', skywars.tokens, '§a'],
    ['Souls', skywars.souls, '§b'],
    ['Heads', skywars.heads, '§d'],
    ['Shards', skywars.shards, '§3'],
    ['Opals', skywars.opals, '§9'],
  ];

  return (
    <Container width={width} height={height} percent={95}>
      {(width) => (
        <div direction="column">
          <Header skin={skin} name={player.prefixName} width={width} sidebar={sidebar}>
            {(height) => (
              <HeaderBody
                title={`§l§bSky§eWars §fStats §r(§o${prettify(mode)}§r)`}
                description={`§bSky§eWars §7Level: ${skywars.levelFormatted}\n${formatProgression(
                  skywars.levelProgression,
                  skywars.levelFormatted,
                  skywars.nextLevelFormatted
                )}`}
                height={height}
              />
            )}
          </Header>
          <SkyWarsModeTable mode="overall" modeStats={modeStats} />
          <div direction="row">
            <SkyWarsModeTable width="50%" mode="insane" modeStats={modeStats} />
            <SkyWarsModeTable width="50%" mode="normal" modeStats={modeStats} />
          </div>
        </div>
      )}
    </Container>
  );
};
