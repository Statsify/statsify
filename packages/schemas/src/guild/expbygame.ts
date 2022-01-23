import { APIData } from '@statsify/util';
import { Field } from '../decorators';

/**
 * Removes some useless broken games from the `guildExpByGameType` field such as `SMP` or `SKYBLOCK`
 */
export class ExpByGame {
  @Field()
  public SKYWARS: number;

  @Field()
  public PROTOTYPE: number;

  @Field()
  public ARCADE: number;

  @Field()
  public DUELS: number;

  @Field()
  public MCGO: number;

  @Field()
  public UHC: number;

  @Field()
  public BUILD_BATTLE: number;

  @Field()
  public GINGERBREAD: number;

  @Field()
  public BEDWARS: number;

  @Field()
  public WALLS: number;

  @Field()
  public SPEED_UHC: number;

  @Field()
  public PAINTBALL: number;

  @Field()
  public ARENA: number;

  @Field()
  public TNTGAMES: number;

  @Field()
  public PIT: number;

  @Field()
  public BATTLEGROUND: number;

  @Field()
  public MURDER_MYSTERY: number;

  @Field()
  public VAMPIREZ: number;

  @Field()
  public SURVIVAL_GAMES: number;

  @Field()
  public SUPER_SMASH: number;

  @Field()
  public WALLS3: number;

  @Field()
  public QUAKECRAFT: number;

  @Field()
  public HOUSING: number;

  public constructor(data: APIData) {
    this.SKYWARS = data.SKYWARS;
    this.PROTOTYPE = data.PROTOTYPE;
    this.ARCADE = data.ARCADE;
    this.DUELS = data.DUELS;
    this.MCGO = data.MCGO;
    this.UHC = data.UHC;
    this.BUILD_BATTLE = data.BUILD_BATTLE;
    this.GINGERBREAD = data.GINGERBREAD;
    this.BEDWARS = data.BEDWARS;
    this.WALLS = data.WALLS;
    this.SPEED_UHC = data.SPEED_UHC;
    this.PAINTBALL = data.PAINTBALL;
    this.ARENA = data.ARENA;
    this.TNTGAMES = data.TNTGAMES;
    this.PIT = data.PIT;
    this.BATTLEGROUND = data.BATTLEGROUND;
    this.MURDER_MYSTERY = data.MURDER_MYSTERY;
    this.VAMPIREZ = data.VAMPIREZ;
    this.SURVIVAL_GAMES = data.SURVIVAL_GAMES;
    this.SUPER_SMASH = data.SUPER_SMASH;
    this.WALLS3 = data.WALLS3;
    this.QUAKECRAFT = data.QUAKECRAFT;
    this.HOUSING = data.HOUSING;
  }
}
