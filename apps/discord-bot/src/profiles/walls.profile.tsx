import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { JSX } from '@statsify/rendering';
import { BaseProfileProps } from './base.profile';
export const WallsProfile: JSX.FC<BaseProfileProps> = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  t,
}) => {
  const { walls } = player.stats;

  const sidebar: SidebarItem[] = [[t('stats.coins'), t(walls.coins), '§6']];

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody title={`§l§eWalls §fStats`} description={`description`} />
      </Header>
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(walls.wins)} color="§a" />
          <Table.td title={t('stats.losses')} value={t(walls.losses)} color="§c" />
          <Table.td title={t('stats.wlr')} value={t(walls.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.kills')} value={t(walls.kills)} color="§a" />
          <Table.td title={t('stats.deaths')} value={t(walls.deaths)} color="§c" />
          <Table.td title={t('stats.kdr')} value={t(walls.kdr)} color="§6" />
          <Table.td title={t('stats.assists')} value={t(walls.assists)} color="§e" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
