import { Flatten } from '@statsify/util';

export type Selector<T> = { [K in keyof Flatten<T>]?: boolean };
