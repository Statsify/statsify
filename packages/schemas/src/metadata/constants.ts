import { Constructor } from '@statsify/util';

export const METADATA_KEY = 'statsify';

export const primitiveConstructors = [
  String,
  Number,
  Boolean,
  Date,
  BigInt,
  Symbol,
] as Constructor[];
