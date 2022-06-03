import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { JSX } from '@statsify/rendering';
import { BaseProfileProps } from '../base.hypixel-command';
export const TurboKartRacersProfile: JSX.FC<BaseProfileProps> = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  t,
}) => {
  const { turbokartracers } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(turbokartracers.coins), '§6'],
    [t('stats.coinsPickedUp'), t(turbokartracers.coinsPickedUp), '§e'],
    [t('stats.boxesPickedUp'), t(turbokartracers.boxesPickedUp), '§c'],
    [t('stats.grandPrixTokens'), t(turbokartracers.grandPrixTokens), '§b'],
    [t('stats.lapsCompleted'), t(turbokartracers.lapsCompleted), '§2'],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody
          title={`§l§#ffd700Turbo §#c0c0c0Kart §#cd7f32Racers §fStats`}
          description={`description`}
        />
      </Header>
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.goldRate')} value={`${turbokartracers.goldRate}%`} color="§6" />
          <Table.td
            title={t('stats.trophyRate')}
            value={`${turbokartracers.trophyRate}%`}
            color="§7"
          />
          <Table.td
            title={t('stats.gamesPlayed')}
            value={t(turbokartracers.gamesPlayed)}
            color="§a"
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t('stats.goldTrophies')}
            value={t(turbokartracers.trophies.gold)}
            color="§#ffd700"
          />
          <Table.td
            title={t('stats.silverTrophies')}
            value={t(turbokartracers.trophies.silver)}
            color="§#c0c0c0"
          />
          <Table.td
            title={t('stats.bronzeTrophies')}
            value={t(turbokartracers.trophies.bronze)}
            color="§#cd7f32"
          />
          <Table.td
            title={t('stats.totalTrophies')}
            value={t(turbokartracers.trophies.total)}
            color="§a"
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
