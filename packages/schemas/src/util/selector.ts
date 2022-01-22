type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  19,
  19,
  20,
  ...0[]
];

/**
 * @example ```ts
 *type Selector<T extends Player> = {
  [K in Paths<T>]?: boolean
 }

 type Selection<T extends Player, O> = {
  [K in keyof O]: K extends Paths<T> ? Get<T, K> : never
 }
 * ```
 */
export type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? T[K] extends object
          ? Join<K, Paths<T[K], Prev[D]>>
          : `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never;
    }[keyof T]
  : '';

export type { Get } from 'type-fest';

type Unflatten<T> = WithoutDeepProps<T> & WithUnflattenedProps<T>;

type WithoutDeepProps<T> = {
  [Property in keyof T as Exclude<Property, `${string}.${string}`>]: T[Property];
};

type WithUnflattenedProps<T> = {
  [Property in keyof T as ParentOf<Property>]: {
    [ChildProperty in ChildOf<Property>]: T[`${ParentOf<Property>}.${ChildProperty}` & keyof T];
  };
};

type ParentOf<T> = T extends `${infer Parent}.${string}` ? Parent : never;
type ChildOf<T> = T extends `${string}.${infer Child}` ? Child : never;

export type DeSelect<T, K = Unflatten<T>> = {
  [P in keyof K]: DeSelect<K[P]>;
};
