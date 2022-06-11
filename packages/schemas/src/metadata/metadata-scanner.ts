import { Constructor } from '@statsify/util';
import { METADATA_KEY } from './constants';
import { ClassMetadata, FieldMetadata } from './metadata.interface';

export type MetadataEntry = [string, FieldMetadata];

export class MetadataScanner {
  private static tokens: Map<Constructor, MetadataEntry[]> = new Map();

  public static scan(target: Constructor) {
    if (this.tokens.has(target)) return this.tokens.get(target)!;

    const metadata = this.getMetadataEntries(target);

    this.tokens.set(target, metadata);

    return metadata;
  }

  private static getMetadataEntries(
    constructor: Constructor,
    base = '',
    baseName = ''
  ): MetadataEntry[] {
    const classMetadata = Reflect.getMetadata(METADATA_KEY, constructor.prototype) as ClassMetadata;

    if (!classMetadata) return [];

    const entries = Object.entries(classMetadata);

    const metadataEntries: MetadataEntry[] = [];

    entries.forEach(([key, value]) => {
      const path = `${base ? `${base}.` : ''}${key}`;
      const name = `${baseName ? `${baseName} ` : ''}${value.leaderboard.name}`;

      if (value.type.primitive || value.type.array)
        return metadataEntries.push([
          path,
          { ...value, leaderboard: { ...value.leaderboard, name } },
        ]);

      //Carry the metadata down to the children
      const subMetadataEntries = this.getMetadataEntries(value.type.type, path, name).map(
        ([path, metadata]) => {
          if (
            !metadata.leaderboard.additionalFields ||
            !metadata.leaderboard.additionalFields.length
          )
            metadata.leaderboard.additionalFields = value.leaderboard.additionalFields;

          if (!metadata.leaderboard.extraDisplay)
            metadata.leaderboard.extraDisplay = value.leaderboard.extraDisplay;

          return [path, metadata] as MetadataEntry;
        }
      );

      metadataEntries.push(...subMetadataEntries);
    });

    return metadataEntries;
  }
}
