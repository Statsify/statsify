/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { UserTier } from "@statsify/schemas";
import type { Image } from "skia-canvas";

export interface FooterProps {
  logo: Image;
  tier?: UserTier;
  border?: JSX.IntrinsicElements["box"]["border"];
}

export const Footer = ({ logo, tier = UserTier.NONE, border }: FooterProps) => {
  const margin = 8;

  let text: string;

  switch (tier) {
    case UserTier.CORE:
      text =
        "§#f5c6cds§#eaa2abt§#de7d89a§#d35967t§#cb3d4cs§#c92f40i§#c82235f§#c61429y§#b80d21.§#a4091bn§#8f0415e§#7b000ft";
      break;
    case UserTier.STAFF:
      text =
        "§#fec1e1s§#efb4e5t§#e0a7eaa§#d19aeet§#c48ff1s§#ba88f1i§#b181f1f§#a77af1y§#9c72e9.§#9069dcn§#8560d0e§#7957c3t";
      break;
    case UserTier.EMERALD:
      text =
        "§#d4ffe7s§#a8fbc5t§#7df7a3a§#51f382t§#31ee68s§#28e760i§#1fdf59f§#16d851y§#10cb46.§#0abb3bn§#05ab2fe§#009b24t";
      break;
    case UserTier.DIAMOND:
      text =
        "§#cdfff4s§#bcfeeft§#aafceba§#99fbe6t§#86f9e1s§#70f4ddi§#59f0d8f§#43ebd4y§#36e1ca.§#2dd4ben§#23c7b3e§#1abaa7t";
      break;
    case UserTier.GOLD:
      text =
        "§#fffddas§#fefab3t§#fdf88da§#fdf566t§#fcf04as§#fbe546i§#fadb41f§#f9d03dy§#f5c533.§#f0b928n§#eaae1ce§#e5a211t";
      break;
    case UserTier.IRON:
      text =
        "§#eaeaeas§#e3e3e3t§#dcdcdca§#d5d5d5t§#cececes§#c9c9c9i§#c5c5c5f§#c0c0c0y§#b7b7b7.§#acacacn§#a2a2a2e§#979797t";
      break;
    case UserTier.NONE:
      text =
        "§#d0efffs§#a3d9fct§#75c2f9a§#48acf6t§#289af0s§#2391e6i§#1f87dbf§#1a7ed1y§#1777c8.§#1572c0n§#136cb9e§#1167b1t";
      break;
  }

  return (
    <box width="100%" align="center" border={border}>
      <img
        margin={{ left: margin, top: margin / 2, bottom: margin / 2, right: margin }}
        image={logo}
      />
      <text t:ignore>{text}</text>
    </box>
  );
};
