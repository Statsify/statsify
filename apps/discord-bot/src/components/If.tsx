import { JSX } from '@statsify/jsx';
import { noop } from '@statsify/util';

export interface IfProps {
  condition: boolean;
  children: JSX.Children;
}

export const If: JSX.FC<IfProps> = ({ condition, children }) => {
  if (condition) return <div>{children}</div>;
  return noop();
};
