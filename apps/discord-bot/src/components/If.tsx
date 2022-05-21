import { JSX } from '@statsify/jsx';
import { noop } from '@statsify/util';

export interface IfProps {
  condition: boolean;
  children: JSX.Children;
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
export const If: JSX.FC<IfProps> = ({ condition, children }) => {
  if (condition) return <div>{children}</div>;
  return noop();
};
