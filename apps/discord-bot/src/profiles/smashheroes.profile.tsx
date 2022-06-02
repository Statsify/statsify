import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { JSX } from '@statsify/rendering';
import { SMASH_HEROES_MODES } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from './base.profile';

export interface SmashHeroesProfile extends BaseProfileProps {
  mode: typeof SMASH_HEROES_MODES[number];
}

export const SmashHeroesProfile: JSX.FC<SmashHeroesProfile> = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}) => {
  const { smashheroes } = player.stats;
  const stats = smashheroes[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(smashheroes.coins), '§6'],
    [t('stats.class'), prettify(smashheroes.kit), '§b'],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody
          title={`§l§dSmash §eHeroes §fStats §r(${prettify(mode)})`}
          description={`§dSmash §eHeroes §7Level: ${smashheroes.levelFormatted}`}
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
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
