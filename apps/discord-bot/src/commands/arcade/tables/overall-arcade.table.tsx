import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { Arcade } from '@statsify/schemas';

interface OverallArcadeTableProps {
  stats: Arcade;
  t: LocalizeFunction;
}

export const OverallArcadeTable = ({ stats, t }: OverallArcadeTableProps) => {
  const rowSize = 4;

  const games: [string, number][] = [
    ['Blocking Dead', stats.blockingDead.wins],
    ['Bounty Hunters', stats.bountyHunters.wins],
    ['Dragon Wars', stats.dragonWars.wins],
    ['Ender Spleef', stats.enderSpleef.wins],
    ['Farm Hunt', stats.farmHunt.wins],
    ['Football', stats.football.wins],
    ['Galaxy Wars', stats.galaxyWars.wins],
    ['Hide and Seek', stats.hideAndSeek.overall.wins],
    ['Hole in the Wall', stats.holeInTheWall.wins],
    ['Hypixel Says', stats.hypixelSays.wins],
    ['Mini Walls', stats.miniWalls.wins],
    ['Party Games', stats.partyGames.wins],
    ['Pixel Painters', stats.pixelPainters.wins],
    ['Seasonal', stats.seasonal.totalWins],
    ['Throw Out', stats.throwOut.wins],
    ['Zombies', stats.zombies.overall.wins],
  ];

  games.sort((a, b) => b[1] - a[1]);

  const rows = Array.from({ length: Math.ceil(games.length / rowSize) }, (_, i) =>
    games.slice(i * rowSize, (i + 1) * rowSize)
  );

  const colors = ['§a', '§e', '§6', '§c'];

  return (
    <Table.table>
      {rows.map((row, index) => (
        <Table.tr>
          {row.map((game) => (
            <Table.td title={game[0]} value={t(game[1])} color={colors[index]} />
          ))}
        </Table.tr>
      ))}
    </Table.table>
  );
};
