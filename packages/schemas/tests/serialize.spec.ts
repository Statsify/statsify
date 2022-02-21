import { serialize } from '../src';
import { Field } from '../src/decorators';

describe('serialize', () => {
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
      this.field1 = 'field1';
      this.field2 = 0;
      this.field3 = 3;
      this.field5 = 5;
      this.field6 = new TesterB();
    }
  }

  it('should correctly remove fields', () => {
    const result = serialize(Tester, new Tester());

    expect(result).toEqual({
      field1: 'field1',
      field3: 3,
    });
  });
});
