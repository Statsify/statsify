import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { WarlordsClass, WARLORDS_MODES } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from './base.profile';

interface TNTGamesModeTableProps {
  title: string;
  stats: WarlordsClass;
  t: LocalizeFunction;
}

const WarlordsClassColumn: JSX.FC<TNTGamesModeTableProps> = ({ title, stats, t }) => {
  return (
    <Table.table width="1/4">
      <Table.ts title={title}>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§6" />
        <Table.td title={t('stats.damage')} value={t(stats.damage)} color="§c" />
        <Table.td title={t('stats.healing')} value={t(stats.healing)} color="§a" />
        <Table.td title={t('stats.prevent')} value={t(stats.prevent)} color="§b" />
        <Table.td title={t('stats.total')} value={t(stats.total)} color="§a" />
      </Table.ts>
    </Table.table>
  );
};

export interface WarlordsProfileProps extends BaseProfileProps {
  mode: typeof WARLORDS_MODES[number];
}

export const WarlordsProfile: JSX.FC<WarlordsProfileProps> = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  premium,
  mode,
}) => {
  const { warlords } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(warlords.coins), '§6'],
    [t('stats.class'), prettify(warlords.class), '§e'],
  ];

  let table: JSX.ElementNode;

  switch (mode) {
    case 'overall':
      table = (
        <>
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
        </>
      );
      break;
    case 'classes':
      table = (
        <div direction="row" width="100%">
          <WarlordsClassColumn title="§bMage" stats={warlords.mage} t={t} />
          <WarlordsClassColumn title="§7Warrior" stats={warlords.warrior} t={t} />
          <WarlordsClassColumn title="§ePaladin" stats={warlords.paladin} t={t} />
          <WarlordsClassColumn title="§2Shaman" stats={warlords.shaman} t={t} />
        </div>
      );
      break;
  }

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody description={`Description`} title="§l§cWar§5lords §fStats" />
      </Header>
      {table}
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
