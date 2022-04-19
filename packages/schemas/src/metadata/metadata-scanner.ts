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

  private static getMetadataEntries(constructor: Constructor, base = ''): MetadataEntry[] {
    const classMetadata = Reflect.getMetadata(METADATA_KEY, constructor.prototype) as ClassMetadata;

    if (!classMetadata) return [];

    const entries = Object.entries(classMetadata);

    const metadataEntries: MetadataEntry[] = [];

    for (const [key, value] of entries) {
      const path = `${base ? `${base}.` : ''}${key}`;

      if (value.type.primitive) {
        metadataEntries.push([path, value]);
        continue;
      }

      //Carry the metadata down to the children
      const subMetadataEntries = this.getMetadataEntries(value.type.type, path).map(
        ([path, { store, leaderboard, type }]) => {
          if (!leaderboard.additionalFields || !leaderboard.additionalFields.length)
            leaderboard.additionalFields = value.leaderboard.additionalFields;

          if (!leaderboard.extraDisplay) leaderboard.extraDisplay = value.leaderboard.extraDisplay;

          return [
            path,
            {
              store,
              leaderboard,
              type,
            },
          ] as MetadataEntry;
        }
      );

      metadataEntries.push(...subMetadataEntries);
    }

    return metadataEntries;
  }
}
