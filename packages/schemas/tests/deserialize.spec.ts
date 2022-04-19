import { flatten } from '@statsify/util';
import { Field } from '../src/metadata';
import { deserialize } from '../src/metadata/deserialize';

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

    @Field({ leaderboard: { enabled: false } })
    public field3: number;

    @Field({ store: { store: false } })
    public field4: number;

    @Field()
    public field5: TesterB;

    public constructor() {
      this.field1 = 'field1';
      this.field2 = 0;
      this.field3 = 3;
      this.field5 = new TesterB();
    }
  }

  it('should correctly add fields', () => {
    const result = deserialize(Tester, flatten(new Tester()));

    expect(result).toEqual({
      field1: 'field1',
      field2: 0,
      field3: 3,
      field4: 0,
      field5: {
        field1: 0,
      },
    });
  });
});
