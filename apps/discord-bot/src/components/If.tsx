import { JSX, useChildren } from '@statsify/rendering';
import { noop } from '@statsify/util';

export interface IfProps {
  condition: boolean;
  children: JSX.Children | JSX.Children<() => JSX.Children>;
}

/**
 *
 * @description Conditionally show a component based on a boolean `condition` prop
 * @example
 * ```ts
 * <If condition={true} >
 *  <box><text>Hello World</text></box>
 * </If>
 * ```
 */
export const If: JSX.FC<IfProps> = ({ condition, children: _children }) => {
  const children = useChildren(_children);
  if (condition) {
    return <>{typeof children[0] === 'function' ? children[0]() : children}</>;
  }

  return noop();
};
