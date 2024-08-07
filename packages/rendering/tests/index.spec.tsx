/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createInstructions } from "../src/index.js";
import { expect,it, suite } from "vitest";

suite("createInstructions with no relative sizes", () => {
  it("a box with defined sizes", () => {
    const instructions = createInstructions(<div width={10} height={10} />);

    expect(instructions.x.size).toBe(10);
    expect(instructions.y.size).toBe(10);
  });

  it("a box with no defined sizes and no children", () => {
    const instructions = createInstructions(<div />);

    expect(instructions.x.size).toBe(0);
    expect(instructions.y.size).toBe(0);
  });

  it("a parent that is smaller than its child", () => {
    const child = <div width={10} height={10} />;

    const parent = (
      <div width={5} height={5}>
        {child}
      </div>
    );

    const instructions = createInstructions(parent);

    expect(instructions.x.size).toBe(10);
    expect(instructions.y.size).toBe(10);
  });
});

suite("createInstructions with relative sizes", () => {
  it("percentages that exceed 100%", () => {
    expect(() => (
      <div>
        <div width="51%" />
        <div width="51%" />
      </div>
    )).toThrow("Space required exceeds 100%");
  });

  it("percentages that are 100% with extra elements", () => {
    expect(() => (
      <div>
        <div width="50%" />
        <div width="50%" />
        <div width={1} />
      </div>
    )).toThrow("Space required exceeds 100%");
  });

  it("simple percentage widths", () => {
    const instructions = createInstructions(
      <div width={10}>
        <div width="50%" />
        <div width="50%" />
      </div>
    );

    expect(instructions.x.size).toBe(10);
    expect(instructions.children![0].x.size).toBe(5);
    expect(instructions.children![1].x.size).toBe(5);
  });

  it("normalizing percentage widths", () => {
    const instructions = createInstructions(
      <div>
        <div width="50%">
          <div width={12} height={10} />
        </div>
        <div width="50%">
          <div width={10} height={12} />
        </div>
      </div>
    );

    expect(instructions.x.size).toBe(12 * 2);
    expect(instructions.y.size).toBe(12);
    expect(instructions.children![0].x.size).toBe(12);
    expect(instructions.children![1].y.size).toBe(12);
  });

  it("calculating parent size by using reverse percentages", () => {
    const instructions = createInstructions(
      <div>
        <div width="95%" height="95%">
          <div width={95} height={95} />
        </div>
      </div>
    );

    expect(instructions.x.size).toBe(100);
    expect(instructions.y.size).toBe(100);
  });
});

suite("createInstructions with remaining sizes", () => {
  it("a basic remaining size", () => {
    const parentHeight = 10;

    const parent = (
      <div width={10} height={parentHeight} direction="row">
        <div width={4} height={parentHeight} />
        <div width="remaining" height={parentHeight} />
      </div>
    );

    const instructions = createInstructions(parent);

    expect(instructions.x.size).toBe(10);
    expect(instructions.children![1].x.size).toBe(6);
  });

  it("a basic remaining size on the other axis", () => {
    const parentHeight = 10;

    const parent = (
      <div height={parentHeight}>
        <div height={parentHeight} />
        <div height="remaining" />
        <div height="remaining" />
      </div>
    );

    const instructions = createInstructions(parent);

    expect(instructions.y.size).toBe(parentHeight);
    expect(instructions.children![0].y.size).toBe(parentHeight);
    expect(instructions.children![1].y.size).toBe(parentHeight);
    expect(instructions.children![2].y.size).toBe(parentHeight);
  });
});

suite("JSX Fragments", () => {
  it("JSX Fragments", () => {
    const instructions = createInstructions(
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
