import { Container, Footer, Header, SidebarItem, Table } from '#components';
import { UHC_MODES } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';

export interface UHCProfileProps extends BaseProfileProps {
  mode: typeof UHC_MODES[number];
}

export const UHCProfile = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}: UHCProfileProps) => {
  const { uhc } = player.stats;
  const stats = uhc[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(uhc.coins), '§6'],
    [t('stats.score'), t(uhc.score), '§b'],
    [t('stats.title'), uhc.title, '§e'],
    [t('stats.kit'), prettify(uhc.kit), '§a'],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l§6UHC §fStats §r(${prettify(mode)})`}
        description={`§6UHC §7Level: ${uhc.levelFormatted}`}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§e" />
          <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
          <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
          <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.headsEaten')} value={t(stats.headsEaten)} color="§6" />
          <Table.td
            title={t('stats.ultimatesCrafted')}
            value={t(stats.ultimatesCrafted)}
            color="§b"
          />
          <Table.td title={t('stats.extraUltimates')} value={t(stats.extraUltimates)} color="§d" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
