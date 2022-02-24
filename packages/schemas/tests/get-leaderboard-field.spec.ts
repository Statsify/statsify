import { getLeaderboardField } from '../src';
import { Field } from '../src/decorators';

describe('getLeaderboardField', () => {
  class TesterB {
    @Field()
    public wins: number;

    @Field()
    public losses: number;

    @Field()
    public wlr: number;
  }

  class TesterA {
    @Field()
    public fieldA: number;

    @Field()
    public fieldB: TesterB;

    public constructor() {
      this.fieldB = new TesterB();
    }
  }

  it('should correctly get leaderboard field metadata', () => {
    const instance = new TesterA();

    expect(getLeaderboardField(instance, 'fieldB.wlr')).toEqual({
      sort: 'DESC',
      name: 'Wlr',
      aliases: [],
      additionalFields: ['fieldB.wins', 'fieldB.losses'],
    });
  });
});
