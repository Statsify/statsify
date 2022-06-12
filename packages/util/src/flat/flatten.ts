import { APIData, isObject } from '..';

export type Flatten<T> = Record<string | keyof T, any>;

/**
 *
 * @param data The object to be flattened
 * @param prefix The prefix to be added to the keys
 * @param dest The object to be flattened into
 * @returns The flattened object
 * @example ```ts
 * flatten({ a: { b: 1, c: 2 }, d: 3 }); // { 'a.b': 1, 'a.c': 2, 'd': 3 }
 * ```
 */
export const flatten = <T>(data: T, prefix = '', dest: APIData = {}): Flatten<T> => {
  if (isObject(data)) {
    Object.keys(data ?? {}).forEach((key) => {
      const tmpPrefix = prefix.length > 0 ? prefix + '.' + key : prefix + key;
      flatten(data[key as keyof T], tmpPrefix, dest);
    });
  } else {
    dest[prefix] = data;
  }

  return dest as Flatten<T>;
};
