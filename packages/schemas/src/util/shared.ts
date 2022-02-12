import { Constructor } from '@statsify/util';

/**
 *
 * @param instance A class instance
 * @returns The constructor of the instance
 */
//@ts-ignore - TS doesn't know about the constructor
export const getConstructor = <T>(instance: T): Constructor<T> => instance.constructor;

/**
 * @description Goes through the prototype chain of an object and returns a list of property names in the object
 * @param constructor The constructor to check
 * @returns A list of property names in the constructor
 */
export const getPropertyNames = <T>(instance: T): (keyof T)[] => {
  let obj = instance;
  const result = new Set<keyof T>();
  const filtered = ['name', 'arguments', 'caller', 'apply', 'bind', 'call', '__proto__', 'length'];

  while (obj) {
    const propertyKeys = Object.getOwnPropertyNames(obj);

    propertyKeys.filter((key) => !filtered.includes(key)).forEach((p) => result.add(p as keyof T));

    obj = Object.getPrototypeOf(obj);
  }

  return [...result];
};
