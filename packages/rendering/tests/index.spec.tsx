import { JSX } from '../src';

describe('createInstructions with no relative sizes', () => {
  test('a box with defined sizes', () => {
    const instructions = JSX.createInstructions(<div width={10} height={10} />);

    expect(instructions.x.size).toBe(10);
    expect(instructions.y.size).toBe(10);
  });

  test('a box with no defined sizes and no children', () => {
    const instructions = JSX.createInstructions(<div />);

    expect(instructions.x.size).toBe(0);
    expect(instructions.y.size).toBe(0);
  });

  test('a parent that is smaller than its child', () => {
    const child = <div width={10} height={10} />;

    const parent = (
      <div width={5} height={5}>
        {child}
      </div>
    );

    const insturctions = JSX.createInstructions(parent);

    expect(insturctions.x.size).toBe(10);
    expect(insturctions.y.size).toBe(10);
  });
});

describe('createInstructions with relative sizes', () => {
  test('percentages that exceed 100%', () => {
    expect(() => (
      <div>
        <div width="51%" />
        <div width="51%" />
      </div>
    )).toThrow('Space required exceeds 100%');
  });

  test('percentages that are 100% with extra elements', () => {
    expect(() => (
      <div>
        <div width="50%" />
        <div width="50%" />
        <div width={1} />
      </div>
    )).toThrow('Space required exceeds 100%');
  });

  test('simple percentage widths', () => {
    const instructions = JSX.createInstructions(
      <div width={10}>
        <div width="50%" />
        <div width="50%" />
      </div>
    );

    expect(instructions.x.size).toBe(10);
    expect(instructions.children![0].x.size).toBe(5);
    expect(instructions.children![1].x.size).toBe(5);
  });

  test('normalizing percentage widths', () => {
    const insturctions = JSX.createInstructions(
      <div>
        <div width="50%">
          <div width={12} height={10} />
        </div>
        <div width="50%">
          <div width={10} height={12} />
        </div>
      </div>
    );

    expect(insturctions.x.size).toBe(12 * 2);
    expect(insturctions.y.size).toBe(12);
    expect(insturctions.children![0].x.size).toBe(12);
    expect(insturctions.children![1].y.size).toBe(12);
  });

  test('calculating parent size by using reverse percentages', () => {
    const insturctions = JSX.createInstructions(
      <div>
        <div width="95%" height="95%">
          <div width={95} height={95} />
        </div>
      </div>
    );

    expect(insturctions.x.size).toBe(100);
    expect(insturctions.y.size).toBe(100);
  });
});

describe('createInstructions with remaining sizes', () => {
  test('a basic remaining size', () => {
    const parentHeight = 10;

    const parent = (
      <div width={10} height={parentHeight} direction="row">
        <div width={4} height={parentHeight} />
        <div width="remaining" height={parentHeight} />
      </div>
    );

    const insturctions = JSX.createInstructions(parent);

    expect(insturctions.x.size).toBe(10);
    expect(insturctions.children![1].x.size).toBe(6);
  });

  test('a basic remaining size on the other axis', () => {
    const parentHeight = 10;

    const parent = (
      <div height={parentHeight}>
        <div height={parentHeight} />
        <div height="remaining" />
        <div height="remaining" />
      </div>
    );

    const insturctions = JSX.createInstructions(parent);

    expect(insturctions.y.size).toBe(parentHeight);
    expect(insturctions.children![0].y.size).toBe(parentHeight);
    expect(insturctions.children![1].y.size).toBe(parentHeight);
    expect(insturctions.children![2].y.size).toBe(parentHeight);
  });
});

describe('JSX Fragments', () => {
  test('JSX Fragments', () => {
    const instructions = JSX.createInstructions(
      <div>
        <>
          <div width={10} height={10} />
          <div width={10} height={10} />
        </>
      </div>
    );

    expect(instructions.children?.length).toBe(2);
  });
});
