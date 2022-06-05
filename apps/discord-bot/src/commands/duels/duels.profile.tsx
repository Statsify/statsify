import { Container, Footer, Header, SidebarItem } from '#components';
import { DuelsModes } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';
import {
  BridgeDuelsTable,
  MultiDuelsGameModeTable,
  SingleDuelsGameModeTable,
  UHCDuelsTable,
} from './tables';

export interface DuelsProfileProps extends BaseProfileProps {
  mode: DuelsModes[number];
}

export const DuelsProfile = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}: DuelsProfileProps) => {
  const { duels } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(duels.coins), '§6'],
    [t('stats.lootChests'), t(duels.lootChests), '§e'],
    [t('stats.pingRange'), `${t(duels.pingRange)}ms`, '§2'],
    [t('stats.blocksPlaced'), t(duels.overall.blocksPlaced), '§9'],
  ];

  let table: JSX.Element;

  switch (mode) {
    case 'bridge':
      table = <BridgeDuelsTable stats={duels[mode]} t={t} />;
      break;
    case 'uhc':
      table = <UHCDuelsTable stats={duels[mode]} t={t} />;
      break;
    case 'skywars':
    case 'op':
    case 'megawalls':
      table = <MultiDuelsGameModeTable stats={duels[mode]} t={t} />;
      break;
    default:
      table = <SingleDuelsGameModeTable stats={duels[mode]} t={t} />;
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l§bDuels §fStats §r(${prettify(mode)})`}
        description={`§d${prettify(mode)} Title\n${duels[mode].titleFormatted}`}
      />
      {table}
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
