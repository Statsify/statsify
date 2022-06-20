/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from '#components';
import { FormattedGame, UHC_MODES } from '@statsify/schemas';
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
  tier,
  badge,
  mode,
  t,
  time,
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
        title={`§l${FormattedGame.UHC} §fStats §r(${prettify(mode)})`}
        description={`${FormattedGame.UHC} §7Level: ${uhc.levelFormatted}`}
        time={time}
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
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
