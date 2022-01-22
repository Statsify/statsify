import type { DeSelect, Get, Paths, Player } from '@statsify/schemas';

export type PlayerSelector = {
  [K in Paths<Player>]?: boolean;
};

export type PlayerSelection<T> = DeSelect<{
  [K in keyof T]: T[K] extends true ? (K extends Paths<Player> ? Get<Player, K> : never) : never;
}>;
