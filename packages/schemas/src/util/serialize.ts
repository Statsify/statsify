import { Logger } from '@statsify/logger';
import { Constructor, isObject } from '@statsify/util';
import { FieldMetadata } from '../decorators';
import { getConstructor, getPropertyNames } from './shared';

export const serialize = <T>(constructor: Constructor<T>, instance: T) => {
  const propertyKeys = getPropertyNames(constructor);

  for (const propertyKey of propertyKeys) {
    if (typeof instance[propertyKey] === 'function') continue;

    const metadata: FieldMetadata = Reflect.getMetadata(
      'statsify:field',
      constructor.prototype,
      propertyKey as string
    );

    if (!metadata) {
      new Logger('Serialization').warn(`${propertyKey} in ${constructor.name} has no metadata`);
      continue;
    }

    if (metadata.getter) {
      delete instance[propertyKey];
      continue;
    }

    const value = instance[propertyKey];

    if (
      !metadata.store ||
      value === metadata.default ||
      value === undefined ||
      (value as unknown as number) === 0
    ) {
      delete instance[propertyKey];
    }

    if (isObject(instance[propertyKey])) {
      const constructor = getConstructor(instance[propertyKey]);
      instance[propertyKey] = serialize(constructor, instance[propertyKey]);

      if (Object.keys(instance[propertyKey]).length === 0) {
        delete instance[propertyKey];
      }
    }
  }

  return instance;
};
