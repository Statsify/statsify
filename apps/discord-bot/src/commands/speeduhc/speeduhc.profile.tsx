import { Container, Footer, Header, If, SidebarItem, Table } from '#components';
import { SpeedUHCMode, SPEED_UHC_MODES } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';

export interface SpeedUHCProfileProps extends BaseProfileProps {
  mode: typeof SPEED_UHC_MODES[number];
}

export const SpeedUHCProfile = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}: SpeedUHCProfileProps) => {
  const { speeduhc } = player.stats;
  const stats = speeduhc[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(speeduhc.coins), '§6'],
    [t('stats.score'), t(speeduhc.score), '§b'],
    [t('stats.title'), speeduhc.title, '§e'],
    [t('stats.mastery'), prettify(speeduhc.activeMastery), '§a'],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l§bSpeed§6UHC §fStats §r(${prettify(mode)})`}
        description={`§bSpeed§6UHC §7Level: ${speeduhc.levelFormatted}`}
      />
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
          <If condition={Boolean('assists' in stats)}>
            <Table.td
              title={t('stats.assists')}
              value={t((stats as SpeedUHCMode).assists)}
              color="§e"
            />
          </If>
        </Table.tr>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
