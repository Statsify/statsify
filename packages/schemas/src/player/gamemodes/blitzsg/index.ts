import { sub } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../decorators';
import { BlitzSGKit } from './kit';
import { BlitzSGMode, BlitzSGOverall } from './mode';

export class BlitzSG {
  @Field()
  public coins: number;

  @Field({ default: 'none' })
  public kit: string;

  @Field()
  public overall: BlitzSGOverall;

  @Field()
  public solo: BlitzSGMode;

  @Field()
  public doubles: BlitzSGMode;

  @Field({ required: false })
  public arachnologist?: BlitzSGKit;

  @Field({ required: false })
  public archer?: BlitzSGKit;

  @Field({ required: false })
  public armorer?: BlitzSGKit;

  @Field({ required: false })
  public astronaut?: BlitzSGKit;

  @Field({ required: false })
  public baker?: BlitzSGKit;

  @Field({ required: false })
  public blaze?: BlitzSGKit;

  @Field({ required: false })
  public creepertamer?: BlitzSGKit;

  @Field({ required: false })
  public diver?: BlitzSGKit;

  @Field({ required: false })
  public donkeytamer?: BlitzSGKit;

  @Field({ required: false })
  public farmer?: BlitzSGKit;

  @Field({ required: false })
  public fisherman?: BlitzSGKit;

  @Field({ required: false })
  public florist?: BlitzSGKit;

  @Field({ required: false })
  public golem?: BlitzSGKit;

  @Field({ required: false })
  public guardian?: BlitzSGKit;

  @Field({ required: false })
  public horsetamer?: BlitzSGKit;

  @Field({ required: false })
  public hunter?: BlitzSGKit;

  @Field({ required: false })
  public hypetrain?: BlitzSGKit;

  @Field({ required: false })
  public jockey?: BlitzSGKit;

  @Field({ required: false })
  public knight?: BlitzSGKit;

  @Field({ required: false })
  public meatmaster?: BlitzSGKit;

  @Field({ required: false })
  public necromancer?: BlitzSGKit;

  @Field({ required: false })
  public paladin?: BlitzSGKit;

  @Field({ required: false })
  public random?: BlitzSGKit;

  @Field({ required: false })
  public ranger?: BlitzSGKit;

  @Field({ required: false })
  public rambo?: BlitzSGKit;

  @Field({ required: false })
  public pigman?: BlitzSGKit;

  @Field({ required: false })
  public phoenix?: BlitzSGKit;

  @Field({ required: false })
  public reaper?: BlitzSGKit;

  @Field({ required: false })
  public reddragon?: BlitzSGKit;

  @Field({ required: false })
  public rogue?: BlitzSGKit;

  @Field({ required: false })
  public scout?: BlitzSGKit;

  @Field({ required: false })
  public shadowknight?: BlitzSGKit;

  @Field({ required: false })
  public slimeyslime?: BlitzSGKit;

  @Field({ required: false })
  public snowman?: BlitzSGKit;

  @Field({ required: false })
  public speleologist?: BlitzSGKit;

  @Field({ required: false })
  public tim?: BlitzSGKit;

  @Field({ required: false })
  public toxicologist?: BlitzSGKit;

  @Field({ required: false })
  public troll?: BlitzSGKit;

  @Field({ required: false })
  public viking?: BlitzSGKit;

  @Field({ required: false })
  public warlock?: BlitzSGKit;

  @Field({ required: false })
  public warrior?: BlitzSGKit;

  @Field({ required: false })
  public wolftamer?: BlitzSGKit;

  @Field({ required: false })
  public milkman?: BlitzSGKit;

  @Field({ required: false })
  public shark?: BlitzSGKit;
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
