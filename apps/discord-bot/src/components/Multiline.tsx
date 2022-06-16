import { useChildren } from '@statsify/rendering';

export interface MultilineProps {
  children: JSX.IntrinsicElements['text']['children'];
}

export const Multiline = ({ children }: MultilineProps) => (
  <>
    {useChildren(children)
      .join(' ')
      .split('\n')
      .map((t) => (
        <text margin={1}>{t}</text>
      ))}
  </>
);
