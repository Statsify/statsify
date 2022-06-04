import { Container, Footer, Header, HeaderBody, SidebarItem } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { Arcade, ArcadeModes } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from 'commands/base.hypixel-command';
import {
  BlockingDeadTable,
  BountyHuntersTable,
  CaptureTheWoolTable,
  DragonWarsTable,
  EnderSpleefTable,
  FarmHuntTable,
  FootballTable,
  GalaxyWarsTable,
  HideAndSeekTable,
  HoleInTheWallTable,
  HypixelSaysTable,
  MiniWallsTable,
  OverallArcadeTable,
  PartyGamesTable,
  PixelPaintersTable,
  SeasonalTable,
  ThrowOutTable,
  ZombiesTable,
} from './arcade-tables';
import { CreeperAttackTable } from './arcade-tables/creeper-attack.table';

export interface ArcadeProfileProps extends BaseProfileProps {
  mode: ArcadeModes[number];
}

const gameTable = (
  mode: ArcadeModes[number],
  arcade: Arcade,
  t: LocalizeFunction
): JSX.ElementNode => {
  switch (mode) {
    case 'blockingDead':
      return <BlockingDeadTable stats={arcade[mode]} t={t} />;

    case 'bountyHunters':
      return <BountyHuntersTable stats={arcade[mode]} t={t} />;

    case 'captureTheWool':
      return <CaptureTheWoolTable stats={arcade[mode]} t={t} />;

    case 'creeperAttack':
      return <CreeperAttackTable stats={arcade[mode]} t={t} />;

    case 'dragonWars':
      return <DragonWarsTable stats={arcade[mode]} t={t} />;

    case 'enderSpleef':
      return <EnderSpleefTable stats={arcade[mode]} t={t} />;

    case 'farmHunt':
      return <FarmHuntTable stats={arcade[mode]} t={t} />;

    case 'football':
      return <FootballTable stats={arcade[mode]} t={t} />;

    case 'galaxyWars':
      return <GalaxyWarsTable stats={arcade[mode]} t={t} />;

    case 'hideAndSeek':
      return <HideAndSeekTable stats={arcade[mode]} t={t} />;

    case 'holeInTheWall':
      return <HoleInTheWallTable stats={arcade[mode]} t={t} />;

    case 'hypixelSays':
      return <HypixelSaysTable stats={arcade[mode]} t={t} />;

    case 'miniWalls':
      return <MiniWallsTable stats={arcade[mode]} t={t} />;

    case 'partyGames':
      return <PartyGamesTable stats={arcade[mode]} t={t} />;

    case 'pixelPainters':
      return <PixelPaintersTable stats={arcade[mode]} t={t} />;

    case 'seasonal':
      return <SeasonalTable stats={arcade[mode]} t={t} />;

    case 'throwOut':
      return <ThrowOutTable stats={arcade[mode]} t={t} />;

    case 'zombies':
      return <ZombiesTable stats={arcade[mode]} t={t} />;

    default:
      return <OverallArcadeTable stats={arcade} t={t} />;
  }
};

export const ArcadeProfile: JSX.FC<ArcadeProfileProps> = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}) => {
  const { arcade } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.wins'), t(arcade.wins), '§a'],
    [t('stats.coins'), t(arcade.coins), '§6'],
  ];

  const table: JSX.ElementNode = gameTable(mode, arcade, t);

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody
          title={`§l§bArcade §fStats §r(${prettify(mode)})`}
          description={`Description`}
        />
      </Header>
      {table}
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
