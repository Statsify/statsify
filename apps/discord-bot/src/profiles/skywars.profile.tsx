import {
  Container,
  Footer,
  formatProgression,
  Header,
  HeaderBody,
  SidebarItem,
  Table,
} from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import type { SkyWarsGameMode, SkyWarsLabs, SKYWARS_MODES } from '@statsify/schemas';
import { formatTime, prettify } from '@statsify/util';
import { BaseProfileProps } from './base.profile';

interface SkyWarsOverallTableProps {
  t: LocalizeFunction;
  stats: SkyWarsGameMode;
}

const SkyWarsOverallTable: JSX.FC<SkyWarsOverallTableProps> = ({ t, stats }) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
      <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" />
      <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§6" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
      <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
      <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t('stats.assists')} value={t(stats.assists)} color="§a" />
      <Table.td title={t('stats.playtime')} value={formatTime(stats.playtime)} color="§c" />
      <Table.td title={t('stats.kit')} value={prettify(stats.kit)} color="§6" />
    </Table.tr>
  </Table.table>
);

interface SkyWarsLabsTableProps {
  t: LocalizeFunction;
  stats: SkyWarsLabs;
}

const SkyWarsLabsTable: JSX.FC<SkyWarsLabsTableProps> = ({ t, stats }) => {
  const modes = ['lucky', 'rush', 'slime', 'tntMadness'] as const;
  const colors = ['§e', '§b', '§a', '§c'] as const;

  return (
    <Table.table>
      <Table.tr>
        {modes.map((mode, index) => {
          const color = colors[index];

          return (
            <Table.ts title={`§6${prettify(mode)}`}>
              <Table.td
                title={t(`stats.overallWins`)}
                value={t(stats[mode].overall.wins)}
                color={color}
              />
              <Table.td
                title={t(`stats.soloWins`)}
                value={t(stats[mode].solo.wins)}
                color={color}
              />
              <Table.td
                title={t(`stats.doublesWins`)}
                value={t(stats[mode].doubles.wins)}
                color={color}
              />
            </Table.ts>
          );
        })}
      </Table.tr>
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

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(skywars.coins), '§6'],
    [t('stats.lootChests'), t(skywars.lootChests), '§e'],
    [t('stats.tokens'), t(skywars.tokens), '§a'],
    [t('stats.souls'), t(skywars.souls), '§b'],
    [t('stats.heads'), t(skywars.heads), '§d'],
    [t('stats.shards'), t(skywars.shards), '§3'],
    [t('stats.opals'), t(skywars.opals), '§9'],
  ];

  let table: JSX.ElementNode;

  switch (mode) {
    case 'labs':
      table = <SkyWarsLabsTable t={t} stats={skywars[mode]} />;
      break;
    default:
      table = <SkyWarsOverallTable t={t} stats={skywars[mode].overall} />;
      break;
  }

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
      {table}
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
