/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { SmashHeroesMode, SmashHeroesKit } from './mode';

export const SMASH_HEROES_MODES = [
  'overall',
  'solo',
  'doubles',
  'teams',
  'botman',
  'bulk',
  'cakeMonster',
  'cryomancer',
  'generalCluck',
  'greenHood',
  'karakot',
  'marauder',
  'pug',
  'sanic',
  'sergeantShield',
  'shoop',
  'skullfire',
  'spoderman',
  'tinman',
  'voidCrawler',
] as const;
export type SmashHeroesModes = typeof SMASH_HEROES_MODES;

export class SmashHeroes {
  @Field()
  public overall: SmashHeroesMode;

  @Field()
  public solo: SmashHeroesMode;

  @Field()
  public doubles: SmashHeroesMode;

  @Field()
  public teams: SmashHeroesMode;

  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field({ store: { default: 'none' } })
  public kit: string;

  @Field()
  public cakeMonster: SmashHeroesKit;

  @Field()
  public generalCluck: SmashHeroesKit;

  @Field()
  public tinman: SmashHeroesKit;

  @Field()
  public spoderman: SmashHeroesKit;

  @Field()
  public skullfire: SmashHeroesKit;

  @Field()
  public karakot: SmashHeroesKit;

  @Field()
  public bulk: SmashHeroesKit;

  @Field()
  public botman: SmashHeroesKit;

  @Field()
  public sanic: SmashHeroesKit;

  @Field()
  public marauder: SmashHeroesKit;

  @Field()
  public voidCrawler: SmashHeroesKit;

  @Field()
  public pug: SmashHeroesKit;

  @Field()
  public sergeantShield: SmashHeroesKit;

  @Field()
  public cryomancer: SmashHeroesKit;

  @Field()
  public shoop: SmashHeroesKit;

  @Field()
  public greenHood: SmashHeroesKit;
  public constructor(data: APIData) {
    this.overall = new SmashHeroesMode(data, '');
    this.solo = new SmashHeroesMode(data, 'normal');
    this.doubles = new SmashHeroesMode(data, '2v2');
    this.teams = new SmashHeroesMode(data, 'teams');

    this.botman = new SmashHeroesKit('BOTMUN', data.class_stats);
    this.bulk = new SmashHeroesKit('THE_BULK', data.class_stats);
    this.cakeMonster = new SmashHeroesKit('CAKE_MONSTER', data.class_stats);
    this.cryomancer = new SmashHeroesKit('FROSTY', data.class_stats);
    this.generalCluck = new SmashHeroesKit('GENERAL_CLUCK', data.class_stats);
    this.greenHood = new SmashHeroesKit('GREEN_HOOD', data.class_stats);
    this.karakot = new SmashHeroesKit('GOKU', data.class_stats);
    this.marauder = new SmashHeroesKit('MARAUDER', data.class_stats);
    this.pug = new SmashHeroesKit('PUG', data.class_stats);
    this.sanic = new SmashHeroesKit('SANIC', data.class_stats);
    this.sergeantShield = new SmashHeroesKit('SERGEANT_SHIELD', data.class_stats);
    this.shoop = new SmashHeroesKit('SHOOP_DA_WHOOP', data.class_stats);
    this.skullfire = new SmashHeroesKit('SKULLFIRE', data.class_stats);
    this.spoderman = new SmashHeroesKit('SPODERMAN', data.class_stats);
    this.tinman = new SmashHeroesKit('TINMAN', data.class_stats);
    this.voidCrawler = new SmashHeroesKit('DUSK_CRAWLER', data.class_stats);

    this.coins = data.coins;
    this.level = data.smashLevel;
    this.kit = classNames[data.active_class] ?? 'none';
    this.levelFormatted = `§b${this.level ?? 0}§6✶`;
  }
}

const classNames: Record<string, string> = {
  BOTMUN: 'Botmon',
  CAKE_MONSTER: 'Cake Monster',
  DUSK_CRAWLER: 'Void Crawler',
  FROSTY: 'Cryomancer',
  GENERAL_CLUCK: 'General Cluck',
  GOKU: 'Karakot',
  GREEN_HOOD: 'Green Hood',
  MARAUDER: 'Marauder',
  PUG: 'Pug',
  SANIC: 'Sanic',
  SERGEANT_SHIELD: 'Sgt. Shield',
  SHOOP_DA_WHOOP: 'Shoop',
  SKULLFIRE: 'Skullfire',
  SPODERMAN: 'Spoderman',
  THE_BULK: 'Bulk',
  TINMAN: 'Tinman',
};

export * from './mode';
