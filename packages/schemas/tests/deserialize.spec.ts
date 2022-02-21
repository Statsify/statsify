import { deserialize } from '../src';
import { Field } from '../src/decorators';

describe('deserialize', () => {
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

  it('should correctly populate fields', () => {
    const result = deserialize(new Tester(), { field1: 'field1', field3: 2, field5: 10 } as Tester);

    expect(result).toEqual({
      field1: 'field1',
      field2: 0,
      field3: 2,
      field4: 2,
      field5: undefined,
      field6: {
        field1: 0,
      },
    });
  });
});
