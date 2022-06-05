import { Container, Footer, formatProgression, Header, SidebarItem, Table } from '#components';
import { BEDWARS_MODES } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';

export interface BedWarsProfileProps extends BaseProfileProps {
  mode: typeof BEDWARS_MODES[number];
}

export const BedWarsProfile = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}: BedWarsProfileProps) => {
  const { bedwars } = player.stats;
  const stats = bedwars[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(bedwars.coins), '§6'],
    [t('stats.lootChests'), t(bedwars.lootChests), '§e'],
    [t('stats.iron'), t(stats.itemsCollected.iron), '§7'],
    [t('stats.gold'), t(stats.itemsCollected.gold), '§6'],
    [t('stats.diamonds'), t(stats.itemsCollected.diamond), '§b'],
    [t('stats.emeralds'), t(stats.itemsCollected.emerald), '§2'],
  ];

  if (stats.winstreak) sidebar.push([t('stats.winstreak'), t(stats.winstreak), '§a']);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l§cBed§fWars §fStats §r(${prettify(mode)})`}
        description={`§cBed§fWars §7Level: ${bedwars.levelFormatted}\n${formatProgression(
          t,
          bedwars.levelProgression,
          bedwars.levelFormatted,
          bedwars.nextLevelFormatted
        )}`}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
          <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" />
          <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.finalKills')} value={t(stats.finalKills)} color="§a" />
          <Table.td title={t('stats.finalDeaths')} value={t(stats.finalDeaths)} color="§c" />
          <Table.td title={t('stats.fkdr')} value={t(stats.fkdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
          <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
          <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.bedsBroken')} value={t(stats.bedsBroken)} color="§a" />
          <Table.td title={t('stats.bedsLost')} value={t(stats.bedsLost)} color="§c" />
          <Table.td title={t('stats.bblr')} value={t(stats.bblr)} color="§6" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
