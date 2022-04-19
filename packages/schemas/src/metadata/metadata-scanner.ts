import { Constructor } from '@statsify/util';
import { METADATA_KEY } from './constants';
import { ClassMetadata, FieldMetadata } from './metadata.interface';

export type MetadataEntry = [string, FieldMetadata][];

export class MetadataScanner {
  private static tokens: Map<Constructor, MetadataEntry> = new Map();

  public static scan(target: Constructor) {
    if (this.tokens.has(target)) return this.tokens.get(target)!;

    const metadata = this.getMetadataEntries(target);

    this.tokens.set(target, metadata);

    return metadata;
  }

  //TODO(jacobk999): Make this bring some metadata values down to the children. For example if a object has the metadata for additional leaderboard fields all of its keys/values should also have this metadata by default
  private static getMetadataEntries(constructor: Constructor, base = ''): MetadataEntry {
    const classMetadata = Reflect.getMetadata(METADATA_KEY, constructor.prototype) as ClassMetadata;

    if (!classMetadata) return [];

    const entries = Object.entries(classMetadata);

    const metadataEntries: MetadataEntry = [];

    for (const [key, value] of entries) {
      const path = `${base ? `${base}.` : ''}${key}`;

      if (value.type.primitive) {
        metadataEntries.push([path, value]);
        continue;
      }

      metadataEntries.push(...this.getMetadataEntries(value.type.type, path));
    }

    return metadataEntries;
  }
}
