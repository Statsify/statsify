import { Container, Footer, Header, SidebarItem, Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { VampireZLife } from '@statsify/schemas';
import { BaseProfileProps } from '../base.hypixel-command';

interface VampireZRowProps {
  mode: string;
  stats: VampireZLife;
  t: LocalizeFunction;
}

const VampireZRow = ({ mode, stats, t }: VampireZRowProps) => (
  <Table.ts title={mode}>
    <Table.tr>
      <Table.td title={t(`stats.wins`)} value={t(stats.wins)} color="§e" />
      <Table.td title={t(`stats.kills`)} value={t(stats.kills)} color="§a" />
      <Table.td title={t(`stats.deaths`)} value={t(stats.deaths)} color="§c" />
      <Table.td title={t(`stats.kdr`)} value={t(stats.kdr)} color="§6" />
    </Table.tr>
  </Table.ts>
);

export const VampireZProfile = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  t,
  time,
}: BaseProfileProps) => {
  const { vampirez } = player.stats;

  const sidebar: SidebarItem[] = [[t('stats.coins'), t(vampirez.coins), '§6']];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l§4VampireZ §fStats`}
        time={time}
      />
      <Table.table>
        <VampireZRow mode="§6Overall" stats={vampirez.overall} t={t} />
        <VampireZRow mode="§eHuman" stats={vampirez.human} t={t} />
        <VampireZRow mode="§4Vampire" stats={vampirez.vampire} t={t} />
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
