import { roundTo } from '@statsify/math';
import { Constructor, Flatten, unflatten } from '@statsify/util';
import { MetadataScanner } from './metadata-scanner';
import { FieldMetadata } from './metadata.interface';

export const deserialize = <T>(constructor: Constructor<T>, instance: Flatten<T>): T => {
  const metadataEntries = MetadataScanner.scan(constructor) as [keyof Flatten<T>, FieldMetadata][];

  const deserialized: Flatten<T> = {} as Flatten<T>;

  for (const [
    key,
    {
      store: { deserialize: shouldDeserialize, default: defaultValue },
    },
  ] of metadataEntries) {
    deserialized[key] = instance[key];

    //The value should not be processed
    if (!shouldDeserialize) continue;

    //If the value is undefined use the default value
    if (deserialized[key] === undefined) deserialized[key] = defaultValue;

    // If the value is numimercal round it to 2 digits of precision
    if (typeof deserialized[key] === 'number')
      deserialized[key] = roundTo(deserialized[key] as unknown as number) as any;
  }

  //Unflatten the object to return the original type
  return unflatten(deserialized);
};
