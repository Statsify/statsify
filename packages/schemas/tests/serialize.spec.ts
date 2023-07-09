/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field, serialize } from "../src/metadata/index.js";
import { flatten } from "@statsify/util";

describe("serialize", () => {
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
      this.field1 = "field1";
      this.field2 = 0;
      this.field3 = 3;
      this.field5 = new TesterB();
    }
  }

  it("should correctly remove fields", () => {
    const result = serialize(Tester, flatten(new Tester()));

    expect(result).toEqual({
      field1: "field1",
      field3: 3,
    });
  });
});
