import { Logger } from '@statsify/logger';
import { isObject } from '@statsify/util';
import { FieldMetadata, Getter } from '../decorators';

export const deserialize = <T>(instance: T, data: T) => {
  //@ts-ignore - TS doesn't know about the constructor
  const constructor = instance.constructor as Constructor<T>;
  const propertyKeys = Object.getOwnPropertyNames(constructor.prototype).filter(
    (key) => key !== 'constructor'
  ) as (keyof T)[];

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
    } else if (!metadata.getter) {
      instance[propertyKey] = data[propertyKey] ?? metadata.default;
    }
  }

  getters.forEach(([propertyKey, getter]) => {
    instance[propertyKey] = getter(instance);
  });

  return instance;
};
