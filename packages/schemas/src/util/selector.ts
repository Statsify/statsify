import { Flatten } from '@statsify/util';

export type Selector<T> = { [K in keyof (T & Flatten<T>)]?: boolean };
