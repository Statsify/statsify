import { deepAdd, ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Color } from '../../../color';
import { Field } from '../../../decorators';
import { getTitle } from './util';
export class BaseDuelsGameMode {
  @Field()
  public bestWinstreak: number;

  @Field()
  public winstreak: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public swings: number;

  @Field()
  public hits: number;

  @Field()
  public meleeAccuracy: number;

  @Field()
  public bowShots: number;

  @Field()
  public bowHits: number;

  @Field()
  public bowAccuracy: number;

  @Field()
  public blocksPlaced: number;

  public constructor(data: APIData, mode: string) {
    const prefix = mode ? `${mode}_` : mode;

    this.gamesPlayed = data[`${prefix}rounds_played`];
    this.wins = data[`${prefix}wins`];
    this.losses = data[`${prefix}losses`];
    this.kills = data[`${prefix}kills`];
    this.deaths = data[`${prefix}deaths`];
    this.hits = data[`${prefix}melee_hits`];
    this.swings = data[`${prefix}melee_swings`];
    this.bowShots = data[`${prefix}bow_shots`];
    this.bowHits = data[`${prefix}bow_hits`];
    this.blocksPlaced = data[`${prefix}blocks_placed`];
    this.winstreak = data[`current_winstreak_mode_${mode}`];
    this.bestWinstreak = data[`best_winstreak_mode_${mode}`];

    BaseDuelsGameMode.applyRatios(this);
  }

  public static applyRatios(data: BaseDuelsGameMode) {
    data.wlr = ratio(data.wins, data.losses);
    data.kdr = ratio(data.kills, data.deaths);
    data.meleeAccuracy = ratio(data.hits, data.swings, 100);
    data.bowAccuracy = ratio(data.bowHits, data.bowShots, 100);
  }
}

export class BridgeDuelsMode extends BaseDuelsGameMode {
  @Field()
  public goals: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.kills = data[`${mode}_bridge_kills`];
    this.deaths = data[`${mode}_bridge_deaths`];
    this.goals = data[`${mode}_goals`] || data[`${mode}_captures`];

    BaseDuelsGameMode.applyRatios(this);
  }
}

export class BridgeDuels {
  @Field({
    getter: (target: BridgeDuels) => getTitle(target.overall.wins, 'Bridge').raw,
  })
  public title: string;

  @Field({
    getter: (target: BridgeDuels) => getTitle(target.overall.wins, 'Bridge').color,
  })
  public titleColor: Color;

  @Field()
  public titleFormatted: string;

  @Field()
  public overall: BridgeDuelsMode;

  @Field()
  public solo: BridgeDuelsMode;

  @Field()
  public doubles: BridgeDuelsMode;

  @Field()
  public threes: BridgeDuelsMode;

  @Field()
  public fours: BridgeDuelsMode;

  @Field()
  public '2v2v2v2': BridgeDuelsMode;

  @Field()
  public '3v3v3v3': BridgeDuelsMode;

  @Field()
  public ctf: BridgeDuelsMode;

  public constructor(data: APIData) {
    this.solo = new BridgeDuelsMode(data, 'bridge_duel');
    this.doubles = new BridgeDuelsMode(data, 'bridge_doubles');
    this.threes = new BridgeDuelsMode(data, 'bridge_threes');
    this.fours = new BridgeDuelsMode(data, 'bridge_four');
    this['2v2v2v2'] = new BridgeDuelsMode(data, 'bridge_2v2v2v2');
    this['3v3v3v3'] = new BridgeDuelsMode(data, 'bridge_3v3v3v3');
    this.ctf = new BridgeDuelsMode(data, 'capture_threes');

    this.overall = deepAdd(
      BridgeDuelsMode,
      this.solo,
      this.doubles,
      this.threes,
      this.fours,
      this['2v2v2v2'],
      this['3v3v3v3'],
      this.ctf
    );

    this.overall.winstreak = data.current_bridge_winstreak;
    this.overall.bestWinstreak = data.best_bridge_winstreak;

    this.titleFormatted = getTitle(this.overall.wins, 'Bridge').formatted;

    BaseDuelsGameMode.applyRatios(this.overall);
  }
}
export class MultiDuelsGameMode {
  @Field({ store: false })
  public titlePrefix: string;

  @Field({
    getter: (target: MultiDuelsGameMode) => getTitle(target.overall.wins, target.titlePrefix).raw,
  })
  public title: string;

  @Field({
    getter: (target: MultiDuelsGameMode) => getTitle(target.overall.wins, target.titlePrefix).color,
  })
  public titleColor: Color;

  @Field()
  public titleFormatted: string;

  @Field()
  public overall: BaseDuelsGameMode;

  @Field()
  public solo: BaseDuelsGameMode;

  @Field()
  public doubles: BaseDuelsGameMode;

  public constructor(data: APIData, title: string, short: string, long: string) {
    this.solo = new BaseDuelsGameMode(data, `${short}_duel`);
    this.doubles = new BaseDuelsGameMode(data, `${short}_doubles`);

    this.overall = deepAdd(BaseDuelsGameMode, this.solo, this.doubles);
    BaseDuelsGameMode.applyRatios(this.overall);
    this.overall.bestWinstreak = data[`best_${long}_winstreak`];
    this.overall.winstreak = data[`current_${long}_winstreak`];

    this.titlePrefix = title;

    this.titleFormatted = getTitle(this.overall.wins, this.titlePrefix).formatted;
  }
}

export class SingleDuelsGameMode extends BaseDuelsGameMode {
  @Field({ store: false })
  public titlePrefix: string;

  @Field({
    getter: (target: SingleDuelsGameMode) => getTitle(target.wins, target.titlePrefix).raw,
  })
  public title: string;

  @Field({
    getter: (target: SingleDuelsGameMode) => getTitle(target.wins, target.titlePrefix).color,
  })
  public titleColor: Color;

  @Field()
  public titleFormatted: string;

  public constructor(data: APIData, title: string, mode: string) {
    super(data, mode);
    this.titlePrefix = title;
    this.titleFormatted = getTitle(this.wins, this.titlePrefix).formatted;
  }
}

export class UHCDuelsMode extends BaseDuelsGameMode {
  @Field()
  public gapplesAte: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);

    this.gapplesAte = data[`${mode}_golden_apples_eaten`];
  }
}

export class UHCDuels {
  @Field({
    getter: (target: UHCDuels) => getTitle(target.overall.wins, 'UHC').raw,
  })
  public title: string;

  @Field({
    getter: (target: UHCDuels) => getTitle(target.overall.wins, 'UHC').color,
  })
  public titleColor: Color;

  @Field()
  public titleFormatted: string;

  @Field()
  public overall: UHCDuelsMode;

  @Field()
  public solo: UHCDuelsMode;

  @Field()
  public doubles: UHCDuelsMode;

  @Field()
  public fours: UHCDuelsMode;

  @Field()
  public deathmatch: UHCDuelsMode;

  public constructor(data: APIData) {
    this.solo = new UHCDuelsMode(data, 'uhc_duel');
    this.doubles = new UHCDuelsMode(data, 'uhc_doubles');
    this.fours = new UHCDuelsMode(data, 'uhc_four');
    this.deathmatch = new UHCDuelsMode(data, 'uhc_meetup');

    this.overall = deepAdd(UHCDuelsMode, this.solo, this.doubles, this.fours, this.deathmatch);

    this.overall.winstreak = data.current_uhc_winstreak;
    this.overall.bestWinstreak = data.best_uhc_winstreak;

    this.titleFormatted = getTitle(this.overall.wins, 'UHC').formatted;

    BaseDuelsGameMode.applyRatios(this.overall);
  }
}
