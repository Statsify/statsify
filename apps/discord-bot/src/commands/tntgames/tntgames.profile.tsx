import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { JSX } from '@statsify/rendering';
import { formatTime } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';

interface TNTGamesModeTableProps {
  title: string;
  stats: [string, string][];
}

const TNTGamesModeTable: JSX.FC<TNTGamesModeTableProps> = ({ title, stats }) => {
  const colors = ['§a', '§c', '§6'];

  return (
    <Table.table width="1/5">
      <Table.ts title={`§6${title}`}>
        {stats.map(([title, value], index) => (
          <Table.td title={title} value={value} color={colors[index]} size="small" />
        ))}
      </Table.ts>
    </Table.table>
  );
};

export const TNTGamesProfile: JSX.FC<BaseProfileProps> = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  premium,
}) => {
  const { tntgames } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(tntgames.coins), '§6'],
    [t('stats.wins'), t(tntgames.wins), '§e'],
    [t('stats.blocksRan'), t(tntgames.blocksRan), '§7'],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody description={`Description`} title="§l§cTNT Games §fStats" />
      </Header>
      <div direction="row" width="100%">
        <TNTGamesModeTable
          title="PVP Run"
          stats={[
            [t('stats.wins'), t(tntgames.pvpRun.wins)],
            [t('stats.kills'), t(tntgames.pvpRun.kills)],
            [t('stats.wlr'), t(tntgames.pvpRun.wlr)],
          ]}
        />
        <TNTGamesModeTable
          title="TNT Run"
          stats={[
            [t('stats.wins'), t(tntgames.tntRun.wins)],
            [t('stats.wlr'), t(tntgames.tntRun.wlr)],
            [t('stats.bestTime'), formatTime(tntgames.tntRun.record)],
          ]}
        />
        <TNTGamesModeTable
          title="Wizards"
          stats={[
            [t('stats.wins'), t(tntgames.wizards.wins)],
            [t('stats.kills'), t(tntgames.wizards.kills)],
            [t('stats.kdr'), t(tntgames.wizards.kdr)],
          ]}
        />
        <TNTGamesModeTable
          title="TNT Tag"
          stats={[
            [t('stats.wins'), t(tntgames.tntTag.wins)],
            [t('stats.kills'), t(tntgames.tntTag.kills)],
            [t('stats.tags'), t(tntgames.tntTag.tags)],
          ]}
        />
        <TNTGamesModeTable
          title="Bow Spleef"
          stats={[
            [t('stats.wins'), t(tntgames.bowSpleef.wins)],
            [t('stats.hits'), t(tntgames.bowSpleef.hits)],
            [t('stats.wlr'), t(tntgames.bowSpleef.wlr)],
          ]}
        />
      </div>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
