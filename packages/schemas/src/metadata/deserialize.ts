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
  }

  //Unflatten the object to return the original type
  return unflatten(deserialized);
};
