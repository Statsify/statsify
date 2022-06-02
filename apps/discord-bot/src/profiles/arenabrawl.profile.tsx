import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { JSX } from '@statsify/rendering';
import { ARENA_BRAWL_MODES } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from './base.profile';

export interface ArenaBrawlProfileProps extends BaseProfileProps {
  mode: typeof ARENA_BRAWL_MODES[number];
}

export const ArenaBrawlProfile: JSX.FC<ArenaBrawlProfileProps> = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}) => {
  const { arenabrawl } = player.stats;
  const stats = arenabrawl[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(arenabrawl.coins), '§6'],
    [t('stats.keys'), t(arenabrawl.keys), '§e'],
    [t('stats.magicalChests'), t(arenabrawl.magicalChests), '§5'],
    [t('stats.rune'), prettify(arenabrawl.rune), '§2'],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody
          title={`§l§6Arena Brawl §fStats §r(${prettify(mode)})`}
          description={`description`}
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
          <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
          <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
        </Table.tr>
        <Table.ts title={`§6Skills`}>
          <Table.tr>
            <Table.td
              title={t('stats.offensive')}
              value={prettify(arenabrawl.offensive)}
              color="§c"
              size="small"
            />
            <Table.td
              title={t('stats.utility')}
              value={prettify(arenabrawl.utility)}
              color="§e"
              size="small"
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t('stats.support')}
              value={prettify(arenabrawl.support)}
              color="§a"
              size="small"
            />
            <Table.td
              title={t('stats.ultimate')}
              value={prettify(arenabrawl.ultimate)}
              color="§6"
              size="small"
            />
          </Table.tr>
        </Table.ts>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
