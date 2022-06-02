import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { MurderMysteryMode } from '@statsify/schemas';
import { BaseProfileProps } from './base.profile';

interface MurderMysteryModeTableProps {
  title: string;
  stats: MurderMysteryMode;
  t: LocalizeFunction;
  width?: JSX.Measurement;
}

const MurderMysteryModeTable: JSX.FC<MurderMysteryModeTableProps> = ({ title, stats, t }) => (
  <Table.table width="1/5">
    <Table.ts title={`§6${title}`}>
      <Table.td title={t('stats.gamesPlayed')} value={t(stats.gamesPlayed)} color="§e" />
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
      <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§c" />
      <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§b" />
    </Table.ts>
  </Table.table>
);

export const MurderMysteryProfile: JSX.FC<BaseProfileProps> = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  premium,
}) => {
  const { murdermystery } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(murdermystery.coins), '§6'],
    [t('stats.lootChests'), t(murdermystery.lootChests), '§e'],
    [t('stats.murdererWins'), t(murdermystery.murdererWins), '§c'],
    [t('stats.detectiveWins'), t(murdermystery.detectiveWins), '§b'],
    [t('stats.heroWins'), t(murdermystery.heroWins), '§a'],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody description={`Description`} title="§l§4Murder Mystery §fStats" />
      </Header>
      <div width="100%" direction="row">
        <MurderMysteryModeTable title="Overall" stats={murdermystery.overall} t={t} />
        <MurderMysteryModeTable title="Classic" stats={murdermystery.classic} t={t} />
        <MurderMysteryModeTable title="Double Up" stats={murdermystery.doubleUp} t={t} />
        <MurderMysteryModeTable title="Assassins" stats={murdermystery.assassins} t={t} />
        <MurderMysteryModeTable title="Infection" stats={murdermystery.infection} t={t} />
      </div>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
