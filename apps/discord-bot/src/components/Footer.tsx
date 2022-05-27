import { JSX } from '@statsify/rendering';
import type { Image } from 'skia-canvas';

export interface FooterProps {
  logo: Image;
}

export const Footer: JSX.FC<FooterProps> = ({ logo }) => {
  const margin = 8;

  return (
    <box width="100%" align="center">
      <img
        margin={{ left: margin, top: margin / 2, bottom: margin / 2, right: margin }}
        image={logo}
      />
      <text>
        §#d0efffs§#a3d9fct§#75c2f9a§#48acf6t§#289af0s§#2391e6i§#1f87dbf§#1a7ed1y§#1777c8.§#1572c0n§#136cb9e§#1167b1t
      </text>
    </box>
  );
};
