import { APIData } from '@statsify/util';
import { Color, ColorCode } from '../../../color';
import { Field } from '../../../metadata';
import {
  BuildBattleGuessTheBuild,
  BuildBattleMultiplayerMode,
  BuildBattleOverall,
  BuildBattlePro,
} from './mode';
import { getTitleIndex, titleScores } from './util';

export const BUILD_BATTLE_MODES = ['overall'] as const;
export type BuildBattleModes = typeof BUILD_BATTLE_MODES;

export class BuildBattle {
  @Field()
  public overall: BuildBattleOverall;

  @Field()
  public solo: BuildBattleMultiplayerMode;

  @Field()
  public teams: BuildBattleMultiplayerMode;

  @Field()
  public pro: BuildBattlePro;

  @Field()
  public guessTheBuild: BuildBattleGuessTheBuild;

  @Field()
  public coins: number;

  @Field()
  public score: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public votes: number;

  @Field()
  public superVotes: number;

  @Field()
  public title: string;

  @Field()
  public titleFormatted: string;

  @Field()
  public titleColor: Color;

  @Field({ leaderboard: { enabled: false } })
  public latest: number;
  public constructor(data: APIData) {
    this.overall = new BuildBattleOverall(data);
    this.solo = new BuildBattleMultiplayerMode(data, 'solo');
    this.teams = new BuildBattleMultiplayerMode(data, 'teams');
    this.pro = new BuildBattlePro(data);
    this.guessTheBuild = new BuildBattleGuessTheBuild(data);

    this.latest = data.wins_solo_normal_latest;
    this.coins = data.coins;
    this.score = data.score;
    this.gamesPlayed = data.games_played;
    this.votes = data.total_votes;
    this.superVotes = data.super_votes;

    const index = getTitleIndex(this.score);
    const { color, title } = titleScores[index];

    this.title = title;
    this.titleColor = new Color(color as ColorCode);
    this.titleFormatted = `${color}${title}`;
  }
}

export * from './mode';
