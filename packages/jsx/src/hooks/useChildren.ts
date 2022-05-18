import { ElementNode } from '../jsx';

type Child<T> = [T] extends [ElementNode | ElementNode[]]
  ? ElementNode[]
  : T extends any[]
  ? T
  : [T];

export const useChildren = <T>(children: T): Child<T> => {
  return children as any;
};
