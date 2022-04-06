import { Canvas } from 'canvas';
import type * as JSX from '../jsx';

//TODO(jacobk999): Remove this really scuffed code for measuring text and text rendering.
const _ctx = new Canvas(0, 0).getContext('2d');

export const measure = (text: string, size: number) => {
  size = size * 10;

  let bold = false;
  let len = size * 0.05;

  if (!text.startsWith('§')) text = '§7' + text;

  for (const part of text.split('§')) {
    if (part.charAt(0) === 'l') bold = true;
    else if (part.charAt(0) === 'r') bold = false;

    _ctx.font = `${bold ? 'bold' : ''} ${size}px "Minecraft"`;

    len += _ctx.measureText(part.substring(1)).width;
  }

  return len;
};

const colors: Record<string, { color: string; textshadow: string }> = {
  '0': { color: '#000000', textshadow: '#000000' },
  '1': { color: '#0000AA', textshadow: '#00002A' },
  '2': { color: '#00AA00', textshadow: '#002A00' },
  '3': { color: '#00AAAA', textshadow: '#002A2A' },
  '4': { color: '#AA0000', textshadow: '#2A0000' },
  '5': { color: '#AA00AA', textshadow: '#2A002A' },
  '6': { color: '#FFAA00', textshadow: '#2A2A00' },
  '7': { color: '#AAAAAA', textshadow: '#2A2A2A' },
  '8': { color: '#555555', textshadow: '#151515' },
  '9': { color: '#5555FF', textshadow: '#15153F' },
  a: { color: '#55FF55', textshadow: '#153F15' },
  b: { color: '#55FFFF', textshadow: '#153F3F' },
  c: { color: '#FF5555', textshadow: '#3F1515' },
  d: { color: '#FF55FF', textshadow: '#3F153F' },
  e: { color: '#FFFF55', textshadow: '#3F3F15' },
  f: { color: '#FFFFFF', textshadow: '#3F3F3F' },
};

export interface TextProps {
  size?: number;
  margin?: JSX.Spacing;
  children: string[] | string;
}

export const Text: JSX.RawFC<TextProps, string[]> = ({ size = 2, margin = size * 3, children }) => {
  let text = typeof children === 'string' ? children : children.join('\n');

  return {
    name: `Text`,
    render: (ctx, { x, y }) => {
      const shadowOffset = 0.1;
      const adjustedY = y + size * 8;

      size = size * 10;

      if (!text.startsWith('§')) text = '§7' + text;
      ctx.fillStyle = '#ffffff';
      const parts = text.split('§');
      let position = size * 0.05;
      const offset = Math.max(1, size * shadowOffset);

      let bold = false;
      let italic = false;
      let color = colors['7'];

      for (const part of parts) {
        const key = part.charAt(0);
        color = colors[key] || color;

        if (key === 'l') bold = true;
        else if (key === 'n') italic = true;
        else if (key === 'r') {
          bold = false;
          italic = false;
        }
        ctx.font = `${bold ? 'bold' : ''} ${italic ? 'italic' : ''} ${size}px "Minecraft"`;
        ctx.fillStyle = color.textshadow;
        ctx.fillText(
          part.substring(1),
          Math.floor(x + position + offset),
          Math.floor(adjustedY + offset)
        );
        ctx.fillStyle = color.color;
        ctx.fillText(part.substring(1), Math.floor(x + position), Math.floor(adjustedY));
        position += ctx.measureText(part.substring(1)).width;
      }
    },
    dimension: {
      margin,
      width: measure(text, size),
      height: size * 8,
    },
    style: { location: 'center', direction: 'row', align: 'center' },
    children: [],
  };
};
