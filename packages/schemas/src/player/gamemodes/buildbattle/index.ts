import { APIData } from '@statsify/util';
import { Color } from '../../../color';
import { Field } from '../../../decorators';
import {
  BuildBattleGuessTheBuild,
  BuildBattleMultiplayerMode,
  BuildBattleOverall,
  BuildBattlePro,
} from './mode';
import { getTitleIndex, titleScores } from './util';

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

  @Field({ getter: (target: BuildBattle) => titleScores[getTitleIndex(target.score)].title })
  public title: string;

  @Field()
  public titleFormatted: string;

  @Field({ getter: (target: BuildBattle) => titleScores[getTitleIndex(target.score)].color })
  public titleColor: Color;

  public constructor(data: APIData) {
    this.overall = new BuildBattleOverall(data);
    this.solo = new BuildBattleMultiplayerMode(data, 'solo');
    this.teams = new BuildBattleMultiplayerMode(data, 'teams');
    this.pro = new BuildBattlePro(data);
    this.guessTheBuild = new BuildBattleGuessTheBuild(data);

    this.coins = data.coins;
    this.score = data.score;
    this.gamesPlayed = data.games_played;
    this.votes = data.total_votes;
    this.superVotes = data.super_votes;

    const index = getTitleIndex(this.score);

    this.titleFormatted = `${titleScores[index].color}${titleScores[index].title}`;
  }
}
