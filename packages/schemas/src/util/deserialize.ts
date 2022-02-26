import { Logger } from '@statsify/logger';
import { getConstructor, isObject } from '@statsify/util';
import { FieldMetadata, Getter } from '../decorators';
import { getPropertyNames } from './shared';

export const deserialize = <T>(instance: T, data: T) => {
  const constructor = getConstructor(instance);
  const propertyKeys = getPropertyNames(instance);

  const getters: [keyof T, Getter<any>][] = [];

  for (const propertyKey of propertyKeys) {
    if (typeof instance[propertyKey] === 'function') continue;

    const metadata: FieldMetadata = Reflect.getMetadata(
      'statsify:field',
      constructor.prototype,
      propertyKey as string
    );

    if (!metadata) {
      new Logger('Deserialization').warn(`${propertyKey} in ${constructor.name} has no metadata`);
      continue;
    }

    if (metadata.getter) {
      getters.push([propertyKey, metadata.getter]);
      continue;
    }

    if (isObject(instance[propertyKey])) {
      instance[propertyKey] = deserialize(
        instance[propertyKey],
        data[propertyKey] ?? ({} as T[keyof T])
      );
    } else if (!metadata.getter && metadata.store) {
      instance[propertyKey] = data[propertyKey] ?? metadata.default;
    }
  }

  getters.forEach(([propertyKey, getter]) => {
    instance[propertyKey] = getter(instance);
  });

  return instance;
};
