import { APIData } from '@statsify/util';
import { Field } from '../decorators';

export const getLevel = (exp: number) => {
  const required = [
    100000, 150000, 250000, 500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 2500000,
    2500000, 2500000, 2500000, 3000000,
  ];
  let level = 0;

  for (let i = 0; i <= 1000; i += 1) {
    let need = 0;

    if (i >= required.length) need = required[required.length - 1];
    else need = required[i];

    if (exp - need < 0)
      return {
        level: Math.round((level + exp / need) * 100) / 100,
        nextLevelExp: Math.round(need - exp),
      };

    level += 1;
    exp -= need;
  }

  return { level: 1000, nextLevelExp: 0 };
};

export class GuildRank {
  @Field()
  public name: string;

  @Field()
  public tag: string;

  @Field()
  public priority: number;

  @Field()
  public default: boolean;

  public constructor(data: APIData) {
    this.name = data.name;
    this.default = data.default;
    this.tag = data.tag;
    this.priority = data.priority;
  }
}
