import { sub } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';
import { BlitzSGKit } from './kit';
import { BlitzSGMode, BlitzSGOverall } from './mode';

export class BlitzSG {
  @Field()
  public coins: number;

  @Field({ store: { default: 'none' } })
  public kit: string;

  @Field()
  public overall: BlitzSGOverall;

  @Field()
  public solo: BlitzSGMode;

  @Field()
  public doubles: BlitzSGMode;

  @Field({ store: { required: false } })
  public arachnologist?: BlitzSGKit;

  @Field({ store: { required: false } })
  public archer?: BlitzSGKit;

  @Field({ store: { required: false } })
  public armorer?: BlitzSGKit;

  @Field({ store: { required: false } })
  public astronaut?: BlitzSGKit;

  @Field({ store: { required: false } })
  public baker?: BlitzSGKit;

  @Field({ store: { required: false } })
  public blaze?: BlitzSGKit;

  @Field({ store: { required: false } })
  public creepertamer?: BlitzSGKit;

  @Field({ store: { required: false } })
  public diver?: BlitzSGKit;

  @Field({ store: { required: false } })
  public donkeytamer?: BlitzSGKit;

  @Field({ store: { required: false } })
  public farmer?: BlitzSGKit;

  @Field({ store: { required: false } })
  public fisherman?: BlitzSGKit;

  @Field({ store: { required: false } })
  public florist?: BlitzSGKit;

  @Field({ store: { required: false } })
  public golem?: BlitzSGKit;

  @Field({ store: { required: false } })
  public guardian?: BlitzSGKit;

  @Field({ store: { required: false } })
  public horsetamer?: BlitzSGKit;

  @Field({ store: { required: false } })
  public hunter?: BlitzSGKit;

  @Field({ store: { required: false } })
  public hypetrain?: BlitzSGKit;

  @Field({ store: { required: false } })
  public jockey?: BlitzSGKit;

  @Field({ store: { required: false } })
  public knight?: BlitzSGKit;

  @Field({ store: { required: false } })
  public meatmaster?: BlitzSGKit;

  @Field({ store: { required: false } })
  public milkman?: BlitzSGKit;

  @Field({ store: { required: false } })
  public necromancer?: BlitzSGKit;

  @Field({ store: { required: false } })
  public paladin?: BlitzSGKit;

  @Field({ store: { required: false } })
  public phoenix?: BlitzSGKit;

  @Field({ store: { required: false } })
  public pigman?: BlitzSGKit;

  @Field({ store: { required: false } })
  public rambo?: BlitzSGKit;

  @Field({ store: { required: false } })
  public random?: BlitzSGKit;

  @Field({ store: { required: false } })
  public ranger?: BlitzSGKit;

  @Field({ store: { required: false } })
  public reaper?: BlitzSGKit;

  @Field({ store: { required: false } })
  public reddragon?: BlitzSGKit;

  @Field({ store: { required: false } })
  public rogue?: BlitzSGKit;

  @Field({ store: { required: false } })
  public scout?: BlitzSGKit;

  @Field({ store: { required: false } })
  public shadowknight?: BlitzSGKit;

  @Field({ store: { required: false } })
  public shark?: BlitzSGKit;
  @Field({ store: { required: false } })
  public slimeyslime?: BlitzSGKit;

  @Field({ store: { required: false } })
  public snowman?: BlitzSGKit;

  @Field({ store: { required: false } })
  public speleologist?: BlitzSGKit;

  @Field({ store: { required: false } })
  public tim?: BlitzSGKit;

  @Field({ store: { required: false } })
  public toxicologist?: BlitzSGKit;

  @Field({ store: { required: false } })
  public troll?: BlitzSGKit;

  @Field({ store: { required: false } })
  public viking?: BlitzSGKit;

  @Field({ store: { required: false } })
  public warlock?: BlitzSGKit;

  @Field({ store: { required: false } })
  public warrior?: BlitzSGKit;

  @Field({ store: { required: false } })
  public wolftamer?: BlitzSGKit;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.kit = data.defaultkit || 'none';

    this.overall = new BlitzSGOverall(data);

    this.solo = new BlitzSGMode(data, '');
    this.doubles = new BlitzSGMode(data, 'teams_normal');

    this.solo.kills = sub(this.solo.kills, this.doubles.kills);

    this['arachnologist'] = new BlitzSGKit(data, 'arachnologist');
    this['archer'] = new BlitzSGKit(data, 'archer');
    this['armorer'] = new BlitzSGKit(data, 'armorer');
    this['astronaut'] = new BlitzSGKit(data, 'astronaut');
    this['baker'] = new BlitzSGKit(data, 'baker');
    this['blaze'] = new BlitzSGKit(data, 'blaze');
    this['creepertamer'] = new BlitzSGKit(data, 'creepertamer');
    this['diver'] = new BlitzSGKit(data, 'diver');
    this['donkeytamer'] = new BlitzSGKit(data, 'donkeytamer');
    this['farmer'] = new BlitzSGKit(data, 'farmer');
    this['fisherman'] = new BlitzSGKit(data, 'fisherman');
    this['florist'] = new BlitzSGKit(data, 'florist');
    this['golem'] = new BlitzSGKit(data, 'golem');
    this['guardian'] = new BlitzSGKit(data, 'guardian');
    this['horsetamer'] = new BlitzSGKit(data, 'horsetamer');
    this['hunter'] = new BlitzSGKit(data, 'hunter');
    this['hypetrain'] = new BlitzSGKit(data, 'hype train');
    this['jockey'] = new BlitzSGKit(data, 'jockey');
    this['knight'] = new BlitzSGKit(data, 'knight');
    this['meatmaster'] = new BlitzSGKit(data, 'meatmaster');
    this['milkman'] = new BlitzSGKit(data, 'milkman');
    this['necromancer'] = new BlitzSGKit(data, 'necromancer');
    this['paladin'] = new BlitzSGKit(data, 'paladin');
    this['phoenix'] = new BlitzSGKit(data, 'phoenix');
    this['pigman'] = new BlitzSGKit(data, 'pigman');
    this['rambo'] = new BlitzSGKit(data, 'rambo');
    this['random'] = new BlitzSGKit(data, 'random');
    this['ranger'] = new BlitzSGKit(data, 'ranger');
    this['reaper'] = new BlitzSGKit(data, 'reaper');
    this['reddragon'] = new BlitzSGKit(data, 'reddragon');
    this['rogue'] = new BlitzSGKit(data, 'rogue');
    this['scout'] = new BlitzSGKit(data, 'scout');
    this['shadowknight'] = new BlitzSGKit(data, 'shadow knight');
    this['shark'] = new BlitzSGKit(data, 'shark');
    this['slimeyslime'] = new BlitzSGKit(data, 'slimeyslime');
    this['snowman'] = new BlitzSGKit(data, 'snowman');
    this['speleologist'] = new BlitzSGKit(data, 'speleologist');
    this['tim'] = new BlitzSGKit(data, 'tim');
    this['toxicologist'] = new BlitzSGKit(data, 'toxicologist');
    this['troll'] = new BlitzSGKit(data, 'troll');
    this['viking'] = new BlitzSGKit(data, 'viking');
    this['warlock'] = new BlitzSGKit(data, 'warlock');
    this['warrior'] = new BlitzSGKit(data, 'warrior');
    this['wolftamer'] = new BlitzSGKit(data, 'wolftamer');
  }
}

export * from './kit';
export * from './mode';
