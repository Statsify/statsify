import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import {
  BlockingDead,
  BountyHunters,
  CaptureTheWool,
  CreeperAttack,
  DragonWars,
  EnderSpleef,
  FarmHunt,
  Football,
  GalaxyWars,
  HideAndSeek,
  HoleInTheWall,
  HypixelSays,
  MiniWalls,
  PartyGames,
  PixelPainters,
  Seasonal,
  ThrowOut,
  Zombies,
} from './mode';

export const ARCADE_MODES = [
  'overall',
  'blockingDead',
  'bountyHunters',
  'captureTheWool',
  'creeperAttack',
  'dragonWars',
  'enderSpleef',
  'farmHunt',
  'football',
  'galaxyWars',
  'hideAndSeek',
  'holeInTheWall',
  'hypixelSays',
  'miniWalls',
  'partyGames',
  'pixelPainters',
  'seasonal',
  'throwOut',
  'zombies',
] as const;
export type ArcadeModes = typeof ARCADE_MODES;

export class Arcade {
  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Field()
  public blockingDead: BlockingDead;

  @Field()
  public bountyHunters: BountyHunters;

  @Field()
  public captureTheWool: CaptureTheWool;

  @Field()
  public creeperAttack: CreeperAttack;

  @Field()
  public dragonWars: DragonWars;

  @Field()
  public enderSpleef: EnderSpleef;

  @Field()
  public farmHunt: FarmHunt;

  @Field()
  public football: Football;

  @Field()
  public galaxyWars: GalaxyWars;

  @Field()
  public hideAndSeek: HideAndSeek;

  @Field()
  public holeInTheWall: HoleInTheWall;

  @Field()
  public hypixelSays: HypixelSays;

  @Field()
  public miniWalls: MiniWalls;

  @Field()
  public partyGames: PartyGames;

  @Field()
  public pixelPainters: PixelPainters;

  @Field()
  public seasonal: Seasonal;

  @Field()
  public throwOut: ThrowOut;

  @Field()
  public zombies: Zombies;

  public constructor(data: APIData, ap: APIData) {
    this.coins = data.coins;
    this.wins = ap.arcade_arcade_winner;
    this.blockingDead = new BlockingDead(data);
    this.bountyHunters = new BountyHunters(data);
    this.captureTheWool = new CaptureTheWool(ap);
    this.creeperAttack = new CreeperAttack(data);
    this.dragonWars = new DragonWars(data);
    this.enderSpleef = new EnderSpleef(data);
    this.farmHunt = new FarmHunt(data);
    this.football = new Football(data);
    this.galaxyWars = new GalaxyWars(data);
    this.hideAndSeek = new HideAndSeek(data);
    this.holeInTheWall = new HoleInTheWall(data);
    this.hypixelSays = new HypixelSays(data);
    this.miniWalls = new MiniWalls(data);
    this.partyGames = new PartyGames(data);
    this.pixelPainters = new PixelPainters(data);
    this.seasonal = new Seasonal(data);
    this.throwOut = new ThrowOut(data);
    this.zombies = new Zombies(data);
  }
}

export * from './mode';
export * from './seasonal-mode';
