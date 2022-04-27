import Container from 'typedi';
import { FontRenderer } from '../font';
import type { TextNode } from '../font/tokens';
import type * as JSX from '../jsx';

export interface TextProps {
  margin?: JSX.Spacing;
}

export interface TextRenderProps {
  text: TextNode[][];
}

export const component: JSX.RawFC<TextProps, TextRenderProps, string> = ({
  margin = 6,
  children,
}) => {
  const text = [...(children ?? [])].join('');

  //Get a generic instance of font renderer just to lex and measure the text
  const renderer = Container.get(FontRenderer);
  const nodes = renderer.lex(text);

  const { width, height } = renderer.measureText(nodes);

  return {
    dimension: {
      margin,
      width,
      height,
    },
    style: { location: 'center', direction: 'row', align: 'center' },
    props: { text: nodes },
    children: [],
  };
};

export const render: JSX.Render<TextRenderProps> = (ctx, { text }, { x, y }, { renderer }) => {
  renderer.fillText(ctx, text, x, y);
};
