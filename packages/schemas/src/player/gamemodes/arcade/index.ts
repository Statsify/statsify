/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
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
  PixelParty,
  Seasonal,
  ThrowOut,
  Zombies,
} from "./mode";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";

@GameType("overall")
export class Arcade {
  @Field()
  public coins: number;

  @Field()
  public wins: number;

  @Mode("DAYONE")
  @Field()
  public blockingDead: BlockingDead;

  @Mode("ONEINTHEQUIVER")
  @Field()
  public bountyHunters: BountyHunters;

  @Mode("PVP_CTW")
  @Field()
  public captureTheWool: CaptureTheWool;

  @Mode("DEFENDER")
  @Field()
  public creeperAttack: CreeperAttack;

  @Mode("DRAGONWARS2")
  @Field()
  public dragonWars: DragonWars;

  @Mode("ENDER")
  @Field()
  public enderSpleef: EnderSpleef;

  @Mode("FARM_HUNT")
  @Field()
  public farmHunt: FarmHunt;

  @Mode("SOCCER")
  @Field()
  public football: Football;

  @Mode("STARWARS")
  @Field()
  public galaxyWars: GalaxyWars;

  @Mode()
  @Field()
  public hideAndSeek: HideAndSeek;

  @Mode("HOLE_IN_THE_WALL")
  @Field()
  public holeInTheWall: HoleInTheWall;

  @Mode("SIMON_SAYS")
  @Field()
  public hypixelSays: HypixelSays;

  @Mode("MINI_WALLS")
  @Field()
  public miniWalls: MiniWalls;

  @Mode("PARTY")
  @Field()
  public partyGames: PartyGames;

  @Mode("DRAW_THEIR_THING")
  @Field()
  public pixelPainters: PixelPainters;

  @Mode("PIXEL_PARTY")
  @Field()
  public pixelParty: PixelParty;

  @Mode()
  @Field()
  public seasonal: Seasonal;

  @Mode("THROW_OUT")
  @Field()
  public throwOut: ThrowOut;

  @Mode()
  @Field()
  public zombies: Zombies;

  public constructor(data: APIData, ap: APIData) {
    this.coins = data.coins;
    this.wins = ap.arcade_arcade_winner;
    this.blockingDead = new BlockingDead(data);
    this.bountyHunters = new BountyHunters(data);
    this.captureTheWool = new CaptureTheWool(ap);
    this.creeperAttack = new CreeperAttack(data);
    this.dragonWars = new DragonWars(data, ap);
    this.enderSpleef = new EnderSpleef(data);
    this.farmHunt = new FarmHunt(data);
    this.football = new Football(data);
    this.galaxyWars = new GalaxyWars(data);
    this.hideAndSeek = new HideAndSeek(data, ap);
    this.holeInTheWall = new HoleInTheWall(data);
    this.hypixelSays = new HypixelSays(data);
    this.miniWalls = new MiniWalls(data);
    this.partyGames = new PartyGames(data);
    this.pixelPainters = new PixelPainters(data);
    this.pixelParty = new PixelParty(data);
    this.seasonal = new Seasonal(data);
    this.throwOut = new ThrowOut(data);
    this.zombies = new Zombies(data);
  }
}

export type ArcadeModes = StatsifyApiModes<Arcade, "overall">;
export const ARCADE_MODES = new GameModes<ArcadeModes>(GetMetadataModes(Arcade));

export * from "./mode";
export * from "./seasonal-mode";
