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
        "§#ff7373s§#ff6565t§#ff5757a§#ff4949t§#ff3a3as§#ff2929i§#ff1717f§#ff0606y§#fa0001.§#f20002n§#ea0003e§#e20004t";
      break;
    case UserTier.STAFF:
      text =
        "§#ff98d4s§#ff8ed0t§#ff84cba§#ff7ac7t§#ff6fc2s§#ff62bdi§#ff55b8f§#ff48b3y§#fc43b0.§#f940adn§#f53eabe§#f13ca9t";
      break;
    case UserTier.EMERALD:
      text =
        "§#69f262s§#5cf354t§#4ff447a§#43f439t§#36f42cs§#29f11fi§#1def11f§#10ec04y§#0de600.§#0edf00n§#0fd800e§#10d100t";
      break;
    case UserTier.DIAMOND:
      text =
        "§#8fe3ffs§#84e0fft§#79ddffa§#6ddafft§#61d7ffs§#53d3ffi§#46d0fff§#38ccffy§#34c8fa.§#34c5f3n§#35c1ece§#36bde5t";
      break;
    case UserTier.GOLD:
      text =
        "§#ffdc73s§#ffd865t§#ffd557a§#ffd149t§#ffce3as§#ffc929i§#ffc517f§#ffc006y§#f9ba01.§#f0b202n§#e7ab03e§#dea304t";
      break;
    case UserTier.IRON:
      text =
        "§#d0d0d0s§#cbcbcbt§#c7c7c7a§#c2c2c2t§#bdbdbds§#b7b7b7i§#b1b1b1f§#abababy§#a7a7a7.§#a5a5a5n§#a2a2a2e§#a0a0a0t";
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
