import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export class Gamecounts {
  @Field()
  public MAIN_LOBBY: number;

  @Field()
  public TOURNAMENT_LOBBY: number;

  @Field()
  public SMP: number;

  @Field()
  public SPEED_UHC: number;

  @Field()
  public UHC: number;

  @Field()
  public LEGACY: number;

  @Field()
  public ARCADE: number;

  @Field()
  public HOUSING: number;

  @Field()
  public BUILD_BATTLE: number;

  @Field()
  public REPLAY: number;

  @Field()
  public DUELS: number;

  @Field()
  public BATTLEGROUND: number;

  @Field()
  public WALLS3: number;

  @Field()
  public PROTOTYPE: number;

  @Field()
  public SKYBLOCK: number;

  @Field()
  public PIT: number;

  @Field()
  public SURVIVAL_GAMES: number;

  @Field()
  public MURDER_MYSTERY: number;

  @Field()
  public SKYWARS: number;

  @Field()
  public BEDWARS: number;

  @Field()
  public MCGO: number;

  @Field()
  public TNTGAMES: number;

  @Field()
  public SUPER_SMASH: number;

  @Field()
  public LIMBO: number;

  @Field()
  public IDLE: number;

  @Field()
  public QUEUE: number;

  public constructor(data: APIData = {}) {
    this.MAIN_LOBBY = data.MAIN_LOBBY?.players;
    this.TOURNAMENT_LOBBY = data.TOURNAMENT_LOBBY?.players;
    this.SMP = data.SMP?.players;
    this.SPEED_UHC = data.SPEED_UHC?.players;
    this.UHC = data.UHC?.players;
    this.LEGACY = data.LEGACY?.players;
    this.ARCADE = data.ARCADE?.players;
    this.HOUSING = data.HOUSING?.players;
    this.BUILD_BATTLE = data.BUILD_BATTLE?.players;
    this.REPLAY = data.REPLAY?.players;
    this.DUELS = data.DUELS?.players;
    this.BATTLEGROUND = data.BATTLEGROUND?.players;
    this.WALLS3 = data.WALLS3?.players;
    this.PROTOTYPE = data.PROTOTYPE?.players;
    this.SKYBLOCK = data.SKYBLOCK?.players;
    this.PIT = data.PIT?.players;
    this.SURVIVAL_GAMES = data.SURVIVAL_GAMES?.players;
    this.MURDER_MYSTERY = data.MURDER_MYSTERY?.players;
    this.SKYWARS = data.SKYWARS?.players;
    this.BEDWARS = data.BEDWARS?.players;
    this.MCGO = data.MCGO?.players;
    this.TNTGAMES = data.TNTGAMES?.players;
    this.SUPER_SMASH = data.SUPER_SMASH?.players;
    this.LIMBO = data.LIMBO?.players;
    this.IDLE = data.IDLE?.players;
    this.QUEUE = data.QUEUE?.players;
  }
}
