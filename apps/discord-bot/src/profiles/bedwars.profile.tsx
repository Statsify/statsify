import { Container, formatProgression, Header, HeaderBody, SidebarItem, Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import type { Player } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import type { Image } from 'skia-canvas';

export interface BedWarsProfileProps {
  skin: Image;
  player: Player;
  width: number;
  height: number;
  mode: 'overall' | 'solo' | 'doubles' | 'threes' | 'fours' | '4v4';
  t: LocalizeFunction;
}

export const BedWarsProfile: JSX.FC<BedWarsProfileProps> = ({
  skin,
  player,
  mode,
  width,
  height,
  t,
}) => {
  const bedwars = player.stats.bedwars;
  const stats = bedwars[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(bedwars.coins), '§6'],
    [t('stats.lootChests'), t(bedwars.lootChests), '§e'],
    [t('stats.iron'), t(stats.itemsCollected.iron), '§7'],
    [t('stats.gold'), t(stats.itemsCollected.gold), '§6'],
    [t('stats.diamonds'), t(stats.itemsCollected.diamond), '§b'],
    [t('stats.emeralds'), t(stats.itemsCollected.emerald), '§2'],
  ];

  return (
    <Container width={width} height={height} percent={95}>
      {(width) => (
        <div direction="column">
          <Header skin={skin} name={player.prefixName} width={width} sidebar={sidebar}>
            {(height) => (
              <HeaderBody
                title={`§l§cBed§fWars §fStats §r(§o${prettify(mode)}§r)`}
                description={`§cBed§fWars §7Level: ${bedwars.levelFormatted}\n${formatProgression(
                  t,
                  bedwars.levelProgression,
                  bedwars.levelFormatted,
                  bedwars.nextLevelFormatted
                )}`}
                height={height}
              />
            )}
          </Header>
          <Table.table width={width}>
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
        </div>
      )}
    </Container>
  );
};
