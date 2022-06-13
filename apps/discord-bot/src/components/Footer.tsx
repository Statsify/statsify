import { BoxBorderRadius } from '@statsify/rendering/src/components/Box';
import type { Image } from 'skia-canvas';

export interface FooterProps {
  logo: Image;
  premium: boolean | undefined;
  border?: BoxBorderRadius;
}

export const Footer = ({ logo, premium = false, border }: FooterProps) => {
  const margin = 8;

  const text = premium
    ? '§#ffdc73s§#ffd865t§#ffd557a§#ffd149t§#ffce3as§#ffc929i§#ffc517f§#ffc006y§#f9ba01.§#f0b202n§#e7ab03e§#dea304t'
    : '§#d0efffs§#a3d9fct§#75c2f9a§#48acf6t§#289af0s§#2391e6i§#1f87dbf§#1a7ed1y§#1777c8.§#1572c0n§#136cb9e§#1167b1t';

  return (
    <box width="100%" align="center" border={border}>
      <img
        margin={{ left: margin, top: margin / 2, bottom: margin / 2, right: margin }}
        image={logo}
      />
      <text>{text}</text>
    </box>
  );
};
