import { Constructor } from '@statsify/util';

//@ts-ignore - TS doesn't know about the constructor
export const getConstructor = <T>(instance: T): Constructor<T> => instance.constructor;

export const getPropertyNames = <T>(constructor: Constructor<T>): (keyof T)[] => {
  let obj = constructor.prototype;
  const result = new Set<keyof T>();
  const filtered = ['name', 'arguments', 'caller', 'apply', 'bind', 'call', '__proto__', 'length'];

  while (obj) {
    const propertyKeys = Object.getOwnPropertyNames(obj);

    propertyKeys.filter((key) => !filtered.includes(key)).forEach((p) => result.add(p as keyof T));

    obj = Object.getPrototypeOf(obj);
  }

  return [...result];
};
