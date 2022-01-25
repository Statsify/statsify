import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import {
  BlockingDead,
  BountyHunters,
  CaptureTheWool,
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

export class Arcade {
  @Field()
  public coins: number;

  @Field()
  public miniwalls: MiniWalls;

  @Field()
  public bountyHunters: BountyHunters;

  @Field()
  public dragonWars: DragonWars;

  @Field()
  public enderSpleef: EnderSpleef;

  @Field()
  public farmHunt: FarmHunt;

  @Field()
  public football: Football;

  @Field()
  public blockingDead: BlockingDead;

  @Field()
  public galaxyWars: GalaxyWars;

  @Field()
  public holeInTheWall: HoleInTheWall;

  @Field()
  public hideAndSeek: HideAndSeek;

  @Field()
  public hypixelSays: HypixelSays;

  @Field()
  public partyGames: PartyGames;

  @Field()
  public zombies: Zombies;

  @Field()
  public throwOut: ThrowOut;

  @Field()
  public pixelPainters: PixelPainters;

  @Field()
  public captureTheWool: CaptureTheWool;

  @Field()
  public seasonal: Seasonal;

  public constructor(data: APIData, ap: APIData) {
    this.coins = data.coins;
    this.miniwalls = new MiniWalls(data);
    this.bountyHunters = new BountyHunters(data);
    this.dragonWars = new DragonWars(data);
    this.enderSpleef = new EnderSpleef(data);
    this.farmHunt = new FarmHunt(data);
    this.football = new Football(data);
    this.blockingDead = new BlockingDead(data);
    this.galaxyWars = new GalaxyWars(data);
    this.holeInTheWall = new HoleInTheWall(data);
    this.hideAndSeek = new HideAndSeek(data);
    this.hypixelSays = new HypixelSays(data);
    this.partyGames = new PartyGames(data);
    this.zombies = new Zombies(data);
    this.throwOut = new ThrowOut(data);
    this.pixelPainters = new PixelPainters(data);
    this.captureTheWool = new CaptureTheWool(ap);
    this.seasonal = new Seasonal(data);
  }
}
