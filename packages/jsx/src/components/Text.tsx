import { Container } from 'typedi';
import { FontRenderer } from '../font';
import type * as JSX from '../jsx';

export interface TextProps {
  margin?: JSX.Spacing;
  children: string[] | string;

  /**
   * The font renderer to use for the text. Changing this can allow for different fonts to be used
   */
  renderer?: FontRenderer;
}

export const Text: JSX.RawFC<TextProps, string[]> = ({
  margin,
  children,
  renderer = Container.get(FontRenderer),
}) => {
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
