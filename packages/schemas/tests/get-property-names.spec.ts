import { getPropertyNames } from '../src/util/shared';

describe('getPropertyNames', () => {
  class TesterB {
    public field6: number;
  }

  class Tester extends TesterB {
    public field1: string;

    public field2: number;

    public field3: number;

    public field4: number;

    public field5: number;

    public constructor() {
      super();
      this.field1 = 'field1';
      this.field2 = 0;
      this.field3 = 3;
      this.field4 = 4;
      this.field5 = 5;
      this.field6 = 6;
    }
  }

  it('should correctly identify properties', () => {
    const keys = getPropertyNames(new Tester()) as string[];

    expect(
      ['field1', 'field2', 'field3', 'field4', 'field5', 'field6'].every((key) =>
        keys.includes(key)
      )
    ).toBe(true);
  });
});
