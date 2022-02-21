import { Field, FieldMetadata } from '../src/decorators';

describe('@Field', () => {
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
  }

  const [field1, field2, field3, field4, field5] = Object.getOwnPropertyNames(new Tester()).map(
    (field) => Reflect.getMetadata('statsify:field', Tester.prototype, field) as FieldMetadata
  );

  it('should correctly identify leaderboard fields', () => {
    expect(field1.isLeaderboard).toBe(false);
    expect(field2.isLeaderboard).toBe(true);
    expect(field3.isLeaderboard).toBe(false);
    expect(field4.isLeaderboard).toBe(false);
    expect(field5.isLeaderboard).toBe(false);
  });

  it('should correctly identify types', () => {
    expect(field1.type).toBe(String);
    expect(field2.type).toBe(Number);
    expect(field3.type).toBe(Number);
    expect(field4.type).toBe(Number);
    expect(field5.type).toBe(Number);
  });

  it('should correctly identify getters', () => {
    expect(field1.getter).toBeUndefined();
    expect(field2.getter).toBeUndefined();
    expect(field3.getter).toBeUndefined();
    expect(field4.getter).toBeDefined();
    expect(field5.getter).toBeUndefined();
  });

  it('should correctly identify store', () => {
    expect(field1.store).toBe(true);
    expect(field2.store).toBe(true);
    expect(field3.store).toBe(true);
    expect(field4.store).toBe(true);
    expect(field5.store).toBe(false);
  });
});
