import { Container, Footer, Header, SidebarItem, Table } from '#components';
import { FormattedGame, WARLORDS_MODES } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';
import { WarlordsClassTable } from './tables';

export interface WarlordsProfileProps extends BaseProfileProps {
  mode: typeof WARLORDS_MODES[number];
}

export const WarlordsProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  premium,
  mode,
  time,
}: WarlordsProfileProps) => {
  const { warlords } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(warlords.coins), '§6'],
    [t('stats.class'), prettify(warlords.class), '§e'],
  ];

  let table: JSX.Element;

  switch (mode) {
    case 'overall':
      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t('stats.wins')} value={t(warlords.wins)} color="§a" />
            <Table.td title={t('stats.losses')} value={t(warlords.losses)} color="§c" />
            <Table.td title={t('stats.wlr')} value={t(warlords.wlr)} color="§6" />
            <Table.td title={t('stats.gamesPlayed')} value={t(warlords.gamesPlayed)} color="§e" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t('stats.kills')} value={t(warlords.kills)} color="§a" />
            <Table.td title={t('stats.deaths')} value={t(warlords.deaths)} color="§c" />
            <Table.td title={t('stats.kdr')} value={t(warlords.kdr)} color="§6" />
            <Table.td title={t('stats.assists')} value={t(warlords.assists)} color="§e" />
          </Table.tr>
        </Table.table>
      );
      break;
    case 'classes':
      table = <WarlordsClassTable warlords={warlords} t={t} />;
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.WARLORDS} §fStats`}
        time={time}
      />
      {table}
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
