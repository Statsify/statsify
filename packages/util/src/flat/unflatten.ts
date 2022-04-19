import type { APIData } from '..';
import type { Flatten } from './flatten';

/**
 *
 * @param data The object to be unflattened
 * @example ```ts
 * unflatten({ 'stats.bedwars.wins': 1 }); // { stats: { bedwars: { wins: 1 } } }
 * ```
 */
export const unflatten = <T>(instance: Flatten<T>): T => {
  const result: APIData = {};
  const obj = instance as APIData;

  Object.keys(obj).forEach((k) => {
    if (k.includes('.')) {
      const path = k.split('.');
      const x = path.pop();

      const body = path.reduce((cur, p) => {
        if (!(p in cur)) cur[p] = {};
        return cur[p];
      }, result);

      body[x ?? ''] = obj[k];
    } else {
      result[k] = obj[k];
    }
  });

  return result as T;
};
