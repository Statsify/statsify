import {
  Container,
  Footer,
  formatProgression,
  Header,
  HeaderBody,
  If,
  SidebarItem,
  Table,
} from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import type { SkyWarsMode, SKYWARS_MODES } from '@statsify/schemas';
import { formatTime, prettify } from '@statsify/util';
import { BaseProfileProps } from './base.profile';

interface SkyWarsModeTableProps {
  modeStats: SkyWarsMode;
  mode: 'overall' | 'insane' | 'normal';
  t: LocalizeFunction;
  width?: JSX.Measurement;
}

const SkyWarsModeTable: JSX.FC<SkyWarsModeTableProps> = ({ width, modeStats, mode, t }) => {
  const stats = modeStats[mode];
  const isOverall = mode === 'overall';
  const size = isOverall ? 'regular' : 'small';

  return (
    <Table.table width={width}>
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
    </Table.table>
  );
};

export interface SkyWarsProfileProps extends BaseProfileProps {
  mode: typeof SKYWARS_MODES[number];
}

export const SkyWarsProfile: JSX.FC<SkyWarsProfileProps> = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}) => {
  const { skywars } = player.stats;
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
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody
          title={`§l§bSky§eWars §fStats §r(${prettify(mode)})`}
          description={`§bSky§eWars §7Level: ${skywars.levelFormatted}\n${formatProgression(
            t,
            skywars.levelProgression,
            skywars.levelFormatted,
            skywars.nextLevelFormatted
          )}`}
        />
      </Header>
      <SkyWarsModeTable mode="overall" modeStats={modeStats} t={t} />
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
