/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BoxBorderRadius } from '@statsify/rendering/src/components/Box';
import { UserTier } from '@statsify/schemas';
import type { Image } from 'skia-canvas';

export interface FooterProps {
  logo: Image;
  tier?: UserTier;
  border?: BoxBorderRadius;
}

export const Footer = ({ logo, tier = UserTier.NONE, border }: FooterProps) => {
  const margin = 8;

  let text: string;

  switch (tier) {
    case UserTier.CORE:
      // text =
      // '§#387effs§#1567fft§#184fb6a§#ff4c4ct§#f13030s§#ab1f1fi§#fff586f§#ffee36y§#beb127.§#96fc88n§#47ed31e§#2fa91et';
      text = '§fstatsify.net';
      break;
    case UserTier.PREMIUM:
      text =
        '§#ffdc73s§#ffd865t§#ffd557a§#ffd149t§#ffce3as§#ffc929i§#ffc517f§#ffc006y§#f9ba01.§#f0b202n§#e7ab03e§#dea304t';
      break;
    default:
    case UserTier.NONE:
      text =
        '§#d0efffs§#a3d9fct§#75c2f9a§#48acf6t§#289af0s§#2391e6i§#1f87dbf§#1a7ed1y§#1777c8.§#1572c0n§#136cb9e§#1167b1t';
      break;
  }

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
