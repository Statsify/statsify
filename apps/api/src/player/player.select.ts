import type { DeSelect, Get, Paths, Player } from '@statsify/schemas';

export type PlayerKeys = Paths<Player>;
export type PlayerSelector = {
  [K in PlayerKeys]?: boolean;
};

export type PlayerSelection<T> = DeSelect<{
  [K in keyof T]: T[K] extends true ? (K extends PlayerKeys ? Get<Player, K> : never) : never;
}>;
