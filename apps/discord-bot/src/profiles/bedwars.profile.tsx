import { JSX } from '@statsify/jsx';
import type { Player } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import type { Image } from 'skia-canvas';
import {
  Container,
  formatProgression,
  Header,
  HeaderBody,
  SidebarItem,
  Table,
} from '../components';

export interface BedWarsProfileProps {
  skin: Image;
  player: Player;
  width: number;
  height: number;
  mode: 'overall' | 'solo' | 'doubles' | 'threes' | 'fours' | '4v4';
}

export const BedWarsProfile: JSX.FC<BedWarsProfileProps> = ({
  skin,
  player,
  mode,
  width,
  height,
}) => {
  const bedwars = player.stats.bedwars;
  const stats = bedwars[mode];

  const sidebar: SidebarItem[] = [
    ['Coins', bedwars.coins, '§6'],
    ['Loot Chests', bedwars.lootChests, '§e'],
    ['Iron', stats.itemsCollected.iron, '§7'],
    ['Gold', stats.itemsCollected.gold, '§6'],
    ['Diamonds', stats.itemsCollected.diamond, '§b'],
    ['Emeralds', stats.itemsCollected.emerald, '§2'],
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
              <Table.td title="Wins" value={stats.wins} color="§a" />
              <Table.td title="Losses" value={stats.losses} color="§c" />
              <Table.td title="WLR" value={stats.wlr} color="§6" />
            </Table.tr>
            <Table.tr>
              <Table.td title="Final Kills" value={stats.finalKills} color="§a" />
              <Table.td title="Final Deaths" value={stats.finalDeaths} color="§c" />
              <Table.td title="FKDR" value={stats.fkdr} color="§6" />
            </Table.tr>
            <Table.tr>
              <Table.td title="Kills" value={stats.kills} color="§a" />
              <Table.td title="Deaths" value={stats.deaths} color="§c" />
              <Table.td title="KDR" value={stats.kdr} color="§6" />
            </Table.tr>
            <Table.tr>
              <Table.td title="Beds Broken" value={stats.bedsBroken} color="§a" />
              <Table.td title="Beds Lost" value={stats.bedsLost} color="§c" />
              <Table.td title="BBLR" value={stats.bblr} color="§6" />
            </Table.tr>
          </Table.table>
        </div>
      )}
    </Container>
  );
};
