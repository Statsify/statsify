import { getLeaderboardFields } from '../src';
import { Field } from '../src/decorators';

describe('getLeaderboardFields', () => {
  class TesterB {
    @Field()
    public field1: number;
  }

  class Tester {
    @Field()
    public field1: string;

    @Field()
    public field2: number;

    @Field({ leaderboard: false })
    public field3: number;

    @Field({ getter: () => 2 })
    public field4: number;

    @Field({ store: false })
    public field5: number;

    @Field()
    public field6: TesterB;

    public constructor() {
      this.field6 = new TesterB();
    }
  }

  it('should correctly identify leaderboard fields', () => {
    expect(getLeaderboardFields(new Tester())).toEqual(['field2', 'field6.field1']);
  });
});
