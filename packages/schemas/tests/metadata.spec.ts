/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field, MetadataEntry, MetadataScanner } from "../src/metadata";
import {
  FieldMetadata,
  LeaderboardEnabledMetadata,
} from "../src/metadata/metadata.interface";
import { prettify } from "@statsify/util";

const stringMetadata = (name: string): FieldMetadata => {
  const fieldName = prettify(
    name.slice(Math.max(0, name.lastIndexOf(".") > -1 ? name.lastIndexOf(".") + 1 : 0))
  );

  return {
    leaderboard: {
      enabled: false,
      additionalFields: [],
      name: name.split(".").map(prettify).join(" "),
      fieldName,
    },
    type: { type: String, array: false, primitive: true },
    store: {
      required: true,
      serialize: true,
      deserialize: true,
      store: true,
      default: "",
    },
  };
};

describe("metadata", () => {
  it("should read and write basic string metadata", () => {
    class Clazz {
      @Field()
      public fieldA: string;
    }

    expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
      ["fieldA", stringMetadata("fieldA")],
    ]);
  });

  it("should read and write basic number metadata", () => {
    class Clazz {
      @Field()
      public fieldA: number;
    }

    expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
      [
        "fieldA",
        {
          leaderboard: {
            enabled: true,
            name: prettify("fieldA"),
            fieldName: prettify("fieldA"),
            historicalFieldName: prettify("fieldA"),
            additionalFields: [],
            historicalFields: [],
            aliases: [],
            sort: "DESC",
            limit: 10_000,
            historical: true,
          },
          type: { type: Number, array: false, primitive: true },
          store: {
            required: true,
            serialize: true,
            deserialize: true,
            store: true,
            default: 0,
          },
        },
      ],
    ]);
  });

  it("should read and write leaderboard false metadata", () => {
    class Clazz {
      @Field({ leaderboard: { enabled: false } })
      public fieldA: number;
    }

    expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
      [
        "fieldA",
        {
          leaderboard: {
            enabled: false,
            additionalFields: [],
            historicalFields: [],
            name: prettify("fieldA"),
            fieldName: prettify("fieldA"),
            historicalFieldName: prettify("fieldA"),
          },
          type: { type: Number, array: false, primitive: true },
          store: {
            required: true,
            serialize: true,
            deserialize: true,
            store: true,
            default: 0,
          },
        },
      ],
    ]);
  });

  it("should read and write array metadata", () => {
    class Clazz {
      @Field({ type: () => [String] })
      public fieldA: string[];
    }

    expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
      [
        "fieldA",
        {
          ...stringMetadata("fieldA"),
          type: { type: String, array: true, primitive: true },
        },
      ],
    ]);
  });

  it("should read and write nested metadata", () => {
    class SuperNestedClazz {
      @Field()
      public fieldA: string;
    }

    class NestedClazz {
      @Field()
      public fieldA: string;

      @Field()
      public fieldB: SuperNestedClazz;
    }

    class Clazz {
      @Field()
      public fieldA: string;

      @Field()
      public fieldB: NestedClazz;
    }

    expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
      ["fieldA", stringMetadata("fieldA")],
      ["fieldB.fieldA", stringMetadata("fieldB.fieldA")],
      ["fieldB.fieldB.fieldA", stringMetadata("fieldB.fieldB.fieldA")],
    ]);
  });

  it(`should read and write with inherited metadata`, () => {
    class ParentClazz {
      @Field()
      public fieldA: string;
    }

    class ChildClazz extends ParentClazz {
      @Field()
      public fieldB: string;
    }

    expect(MetadataScanner.scan(ChildClazz)).toEqual<MetadataEntry[]>([
      ["fieldA", stringMetadata("fieldA")],
      ["fieldB", stringMetadata("fieldB")],
    ]);
  });

  it(`should carry down metadata`, () => {
    class ChildClazz {
      @Field()
      public fieldB: number;
    }

    class ParentClazz {
      @Field({ leaderboard: { additionalFields: ["fieldA"], extraDisplay: "fieldA" } })
      public fieldA: ChildClazz;
    }

    const [[, { leaderboard }]] = MetadataScanner.scan(ParentClazz);

    expect(leaderboard).toEqual<LeaderboardEnabledMetadata>({
      enabled: true,
      name: "Field A Field B",
      fieldName: prettify("fieldB"),
      additionalFields: ["fieldA"],
      extraDisplay: "fieldA",
      aliases: [],
      sort: "DESC",
      limit: 10_000,
      historical: true,
    });
  });
});
