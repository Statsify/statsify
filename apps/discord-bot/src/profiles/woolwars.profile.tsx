import {
  Container,
  Footer,
  formatProgression,
  Header,
  HeaderBody,
  SidebarItem,
  Table,
} from '#components';
import { JSX } from '@statsify/rendering';
import { WOOL_WARS_MODES } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from './base.profile';

export interface WoolWarsProfileProps extends BaseProfileProps {
  mode: typeof WOOL_WARS_MODES[number];
}

export const WoolWarsProfile: JSX.FC<WoolWarsProfileProps> = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}) => {
  const { woolwars } = player.stats;
  const stats = woolwars[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.wool'), t(woolwars.coins), '§6'],
    [t('stats.layers'), t(woolwars.layers), '§a'],
    [t('stats.woolPlaced'), t(stats.woolPlaced), '§e'],
    [t('stats.woolBroken'), t(stats.blocksBroken), '§c'],
    [t('stats.powerups'), t(stats.powerups), '§b'],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody
          title={`§l§cWool§9Wars §fStats §r(${prettify(mode)})`}
          description={`§cWool§9Wars §7Level: ${woolwars.levelFormatted}\n${formatProgression(
            t,
            woolwars.levelProgression,
            woolwars.levelFormatted,
            woolwars.nextLevelFormatted
          )}`}
        />
      </Header>
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
          <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" />
          <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
          <Table.td title={t('stats.assists')} value={t(stats.assists)} color="§e" />
          <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
          <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
