import { prettify } from '@statsify/util';
import { Field, MetadataEntry, MetadataScanner } from '../src/metadata';
import { defaultFormatter } from '../src/metadata/field/get-leaderboard-metadata';
import { FieldMetadata, LeaderboardEnabledMetadata } from '../src/metadata/metadata.interface';

const stringMetadata: FieldMetadata = {
  leaderboard: { enabled: false, additionalFields: [] },
  type: { type: String, array: false, primitive: true },
  store: { required: true, serialize: true, deserialize: true, store: true, default: '' },
};

describe('metadata', () => {
  it('should read and write basic string metadata', () => {
    class Clazz {
      @Field()
      public fieldA: string;
    }

    expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([['fieldA', stringMetadata]]);
  });

  it('should read and write basic number metadata', () => {
    class Clazz {
      @Field()
      public fieldA: number;
    }

    expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
      [
        'fieldA',
        {
          leaderboard: {
            enabled: true,
            name: prettify('fieldA'),
            additionalFields: [],
            aliases: [],
            sort: 'DESC',
            formatter: defaultFormatter,
          },
          type: { type: Number, array: false, primitive: true },
          store: { required: true, serialize: true, deserialize: true, store: true, default: 0 },
        },
      ],
    ]);
  });

  it('should read and write leaderboard false metadata', () => {
    class Clazz {
      @Field({ leaderboard: { enabled: false } })
      public fieldA: number;
    }

    expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
      [
        'fieldA',
        {
          leaderboard: { enabled: false, additionalFields: [] },
          type: { type: Number, array: false, primitive: true },
          store: { required: true, serialize: true, deserialize: true, store: true, default: 0 },
        },
      ],
    ]);
  });

  it('should read and write array metadata', () => {
    class Clazz {
      @Field({ type: () => [String] })
      public fieldA: string[];
    }

    expect(MetadataScanner.scan(Clazz)).toEqual<MetadataEntry[]>([
      [
        'fieldA',
        {
          ...stringMetadata,
          type: { type: String, array: true, primitive: true },
        },
      ],
    ]);
  });

  it('should read and write nested metadata', () => {
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
      ['fieldA', stringMetadata],
      ['fieldB.fieldA', stringMetadata],
      ['fieldB.fieldB.fieldA', stringMetadata],
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
      ['fieldA', stringMetadata],
      ['fieldB', stringMetadata],
    ]);
  });

  it(`should carry down metadata`, () => {
    class ParentClazz {
      @Field({ leaderboard: { additionalFields: ['fieldA'], extraDisplay: 'fieldA' } })
      public fieldA: ChildClazz;
    }

    class ChildClazz {
      @Field()
      public fieldB: number;
    }

    const [[, { leaderboard }]] = MetadataScanner.scan(ParentClazz);

    expect(leaderboard).toEqual<LeaderboardEnabledMetadata>({
      enabled: true,
      name: prettify('fieldB'),
      additionalFields: ['fieldA'],
      extraDisplay: 'fieldA',
      formatter: defaultFormatter,
      aliases: [],
      sort: 'DESC',
    });
  });
});
