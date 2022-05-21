import {
  Container,
  formatProgression,
  Header,
  HeaderBody,
  If,
  SidebarItem,
  Table,
} from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/jsx';
import type { Player, SkyWarsMode } from '@statsify/schemas';
import { formatTime, prettify } from '@statsify/util';
import type { Image } from 'skia-canvas';

interface SkyWarsModeTableProps {
  modeStats: SkyWarsMode;
  mode: 'overall' | 'insane' | 'normal';
  width?: JSX.Measurement;
  t: LocalizeFunction;
}

const SkyWarsModeTable: JSX.FC<SkyWarsModeTableProps> = ({ modeStats, mode, width, t }) => {
  const stats = modeStats[mode];
  const isOverall = mode === 'overall';
  const size = isOverall ? 'regular' : 'small';

  return (
    <Table.table width={width}>
      <Table.ts title={`§e${prettify(mode)}`}>
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" size={size} />
          <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" size={size} />
          <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§6" size={size} />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" size={size} />
          <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" size={size} />
          <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" size={size} />
        </Table.tr>
        <If condition={isOverall}>
          <Table.tr>
            <Table.td title={t('stats.assists')} value={t(stats.assists)} color="§a" size={size} />
            <Table.td
              title={t('stats.playtime')}
              value={formatTime(stats.playtime)}
              color="§c"
              size={size}
            />
            <Table.td title={t('stats.kit')} value={prettify(stats.kit)} color="§6" size={size} />
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
  t: LocalizeFunction;
}

export const SkyWarsProfile: JSX.FC<SkyWarsProfileProps> = ({
  skin,
  player,
  mode,
  width,
  height,
  t,
}) => {
  const skywars = player.stats.skywars;
  const modeStats = skywars[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(skywars.coins), '§6'],
    [t('stats.lootChests'), t(skywars.lootChests), '§e'],
    [t('stats.tokens'), t(skywars.tokens), '§a'],
    [t('stats.souls'), t(skywars.souls), '§b'],
    [t('stats.heads'), t(skywars.heads), '§d'],
    [t('stats.shards'), t(skywars.shards), '§3'],
    [t('stats.opals'), t(skywars.opals), '§9'],
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
                  t,
                  skywars.levelProgression,
                  skywars.levelFormatted,
                  skywars.nextLevelFormatted
                )}`}
                height={height}
              />
            )}
          </Header>
          <SkyWarsModeTable mode="overall" modeStats={modeStats} t={t} />
          <div direction="row">
            <SkyWarsModeTable width="50%" mode="insane" modeStats={modeStats} t={t} />
            <SkyWarsModeTable width="50%" mode="normal" modeStats={modeStats} t={t} />
          </div>
        </div>
      )}
    </Container>
  );
};
