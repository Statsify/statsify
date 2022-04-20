import type { FontRenderer } from '../font';
import type * as JSX from '../jsx';

export interface TextProps {
  margin?: JSX.Spacing;
  children: string[] | string;
  renderer: FontRenderer;
}

export const Text: JSX.RawFC<TextProps, string[]> = ({ margin, children, renderer }) => {
  const text = [...children].join('');
  const nodes = renderer.lex(text);

  const { width, height } = renderer.measureText(nodes);

  if (!margin) {
    margin = 6;
  }

  return {
    name: `Text`,
    render: (ctx, { x, y }) => {
      renderer.fillText(ctx, nodes, x, y);
    },
    dimension: {
      margin,
      width,
      height,
    },
    style: { location: 'center', direction: 'row', align: 'center' },
    children: [],
  };
};
