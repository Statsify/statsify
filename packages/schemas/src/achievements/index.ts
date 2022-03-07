import { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { Player } from '../player';
import { AchievementsGame } from './game';

export class Achievements {
  @Field()
  public arcade: AchievementsGame;

  @Field()
  public arenabrawl: AchievementsGame;

  @Field()
  public bedwars: AchievementsGame;

  @Field()
  public blitzsg: AchievementsGame;

  @Field()
  public buildbattle: AchievementsGame;

  @Field()
  public christmas: AchievementsGame;

  @Field()
  public copsandcrims: AchievementsGame;

  @Field()
  public duels: AchievementsGame;

  @Field()
  public easter: AchievementsGame;

  @Field()
  public general: AchievementsGame;

  @Field()
  public turbokartracers: AchievementsGame;

  @Field()
  public halloween: AchievementsGame;

  @Field()
  public housing: AchievementsGame;

  @Field()
  public murdermystery: AchievementsGame;

  @Field()
  public paintball: AchievementsGame;

  @Field()
  public pit: AchievementsGame;

  @Field()
  public quake: AchievementsGame;

  @Field()
  public skyblock: AchievementsGame;

  @Field()
  public skyclash: AchievementsGame;

  @Field()
  public skywars: AchievementsGame;

  @Field()
  public speeduhc: AchievementsGame;

  @Field()
  public summer: AchievementsGame;

  @Field()
  public smashheroes: AchievementsGame;

  @Field()
  public tntgames: AchievementsGame;

  @Field()
  public crazywalls: AchievementsGame;

  @Field()
  public uhc: AchievementsGame;

  @Field()
  public vampirez: AchievementsGame;

  @Field()
  public walls: AchievementsGame;

  @Field()
  public megawalls: AchievementsGame;

  @Field()
  public warlords: AchievementsGame;

  public constructor(player: Partial<Player>, data: APIData) {
    const oneTime = player.oneTimeAchievements ?? [];
    const tiered = player.tieredAchievements ?? {};

    this.arcade = new AchievementsGame(data, 'arcade', oneTime, tiered);
    this.arenabrawl = new AchievementsGame(data, 'arena', oneTime, tiered);
    this.bedwars = new AchievementsGame(data, 'bedwars', oneTime, tiered);
    this.blitzsg = new AchievementsGame(data, 'blitz', oneTime, tiered);
    this.buildbattle = new AchievementsGame(data, 'buildbattle', oneTime, tiered);
    this.christmas = new AchievementsGame(data, 'christmas2017', oneTime, tiered);
    this.copsandcrims = new AchievementsGame(data, 'copsandcrims', oneTime, tiered);
    this.duels = new AchievementsGame(data, 'duels', oneTime, tiered);
    this.easter = new AchievementsGame(data, 'easter', oneTime, tiered);
    this.general = new AchievementsGame(data, 'general', oneTime, tiered);
    this.turbokartracers = new AchievementsGame(data, 'gingerbread', oneTime, tiered);
    this.halloween = new AchievementsGame(data, 'halloween2017', oneTime, tiered);
    this.housing = new AchievementsGame(data, 'housing', oneTime, tiered);
    this.murdermystery = new AchievementsGame(data, 'murdermystery', oneTime, tiered);
    this.paintball = new AchievementsGame(data, 'paintball', oneTime, tiered);
    this.pit = new AchievementsGame(data, 'pit', oneTime, tiered);
    this.quake = new AchievementsGame(data, 'quake', oneTime, tiered);
    this.skyblock = new AchievementsGame(data, 'skyblock', oneTime, tiered);
    this.skyclash = new AchievementsGame(data, 'skyclash', oneTime, tiered);
    this.skywars = new AchievementsGame(data, 'skywars', oneTime, tiered);
    this.speeduhc = new AchievementsGame(data, 'speeduhc', oneTime, tiered);
    this.summer = new AchievementsGame(data, 'summer', oneTime, tiered);
    this.smashheroes = new AchievementsGame(data, 'supersmash', oneTime, tiered);
    this.tntgames = new AchievementsGame(data, 'tntgames', oneTime, tiered);
    this.crazywalls = new AchievementsGame(data, 'truecombat', oneTime, tiered);
    this.uhc = new AchievementsGame(data, 'uhc', oneTime, tiered);
    this.vampirez = new AchievementsGame(data, 'vampirez', oneTime, tiered);
    this.walls = new AchievementsGame(data, 'walls', oneTime, tiered);
    this.megawalls = new AchievementsGame(data, 'walls3', oneTime, tiered);
    this.warlords = new AchievementsGame(data, 'warlords', oneTime, tiered);
  }
}
