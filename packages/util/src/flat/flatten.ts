import { APIData, isObject } from '..';

//Types adapted from https://stackoverflow.com/a/69322301

// Returns R if T is a function, otherwise returns Fallback
type IsFunction<T, R, Fallback = T> = T extends (...args: any[]) => any ? R : Fallback;

// Returns R if T is an Array, otherwise returns Fallback
type IsArray<T, R, Fallback = T> = T extends Array<unknown> ? R : Fallback;

// Returns R if T is an object, otherwise returns Fallback
type IsObject<T, R, Fallback = T> = IsArray<
  T,
  Fallback,
  IsFunction<T, Fallback, T extends object ? R : Fallback>
>;

// "a.b.c" => "b.c"
type Tail<S> = S extends `${string}.${infer T}` ? Tail<T> : S;

// typeof Object.values(T)
type Value<T> = T[keyof T];

// {a: {b: 1, c: 2}} => {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}}
type FlattenStepOne<T> = {
  [K in keyof T as K extends string
    ? IsObject<T[K], `${K}.${keyof T[K] & string}`, K>
    : K]: IsObject<T[K], { [key in keyof T[K]]: T[K][key] }>;
};

// {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}} => {"a.b": {b: 1}, "a.c": {c: 2}}
type FlattenStepTwo<T> = {
  [a in keyof T]: IsObject<
    T[a],
    Value<{ [M in keyof T[a] as M extends Tail<a> ? M : never]: T[a][M] }>
  >;
};

// {a: {b: 1, c: {d: 1}}} => {"a.b": 1, "a.c": {d: 1}}
type FlattenOneLevel<T> = FlattenStepTwo<FlattenStepOne<T>>;

//Recursively keep flattening until there is no more nesting
export type Flatten<T> = T extends FlattenOneLevel<T> ? T : Flatten<FlattenOneLevel<T>>;

export type FlattenKeys<T> = keyof Flatten<T>;

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
