import { Container, Footer, Header, SidebarItem, Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { BlitzSG, BlitzSGKit, BLITZSG_MODES } from '@statsify/schemas';
import { formatTime, prettify, romanNumeral } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';

interface OverallBlitzSGTableProps {
  blitzsg: BlitzSG;
  t: LocalizeFunction;
}

const OverallBlitzSGTable = ({ blitzsg, t }: OverallBlitzSGTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(blitzsg.overall.wins)} color="§e" />
        <Table.td title={t('stats.kills')} value={t(blitzsg.overall.kills)} color="§a" />
        <Table.td title={t('stats.deaths')} value={t(blitzsg.overall.deaths)} color="§c" />
        <Table.td title={t('stats.kdr')} value={t(blitzsg.overall.kdr)} color="§6" />
      </Table.tr>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§6Solo">
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(blitzsg.solo.wins)} color="§e" size="small" />
          <Table.td
            title={t('stats.kills')}
            value={t(blitzsg.solo.kills)}
            color="§a"
            size="small"
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Doubles">
        <Table.tr>
          <Table.td
            title={t('stats.wins')}
            value={t(blitzsg.doubles.wins)}
            color="§e"
            size="small"
          />
          <Table.td
            title={t('stats.kills')}
            value={t(blitzsg.doubles.kills)}
            color="§a"
            size="small"
          />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);

interface KitBlitzSGTableProps {
  stats: BlitzSGKit;
  t: LocalizeFunction;
}

const KitBlitzSGTable = ({ stats, t }: KitBlitzSGTableProps) => {
  return (
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
        <Table.td title={t('stats.playtime')} value={formatTime(stats.playtime)} color="§e" />
        <Table.td title={t('stats.gamesPlayed')} value={t(stats.gamesPlayed)} color="§b" />
      </Table.tr>
    </Table.table>
  );
};

export interface BlitzSGProfileProps extends BaseProfileProps {
  mode: typeof BLITZSG_MODES[number];
}

export const BlitzSGProfile = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}: BlitzSGProfileProps) => {
  const { blitzsg } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(blitzsg.coins), '§6'],
    [t('stats.kit'), prettify(blitzsg.kit), '§e'],
  ];

  let table: JSX.Element;

  switch (mode) {
    case 'overall':
      table = <OverallBlitzSGTable blitzsg={blitzsg} t={t} />;
      break;
    default: {
      const colors = ['§a', '§a', '§2', '§2', '§e', '§e', '§6', '§6', '§c', '§4'];
      const stats = blitzsg[mode];

      let level = stats.prestige ? `§6${'✫'.repeat(stats.prestige)}` : romanNumeral(stats.level);
      if (stats.level === 10) level = `§l${level}`;
      sidebar.push([t('stats.level'), level, colors[stats.level - 1]]);

      table = <KitBlitzSGTable stats={stats} t={t} />;
      break;
    }
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l§2Blitz§6SG §fStats §r(${prettify(mode)})`}
      />
      {table}
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
