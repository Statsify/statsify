/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { User, UserLogo } from "@statsify/schemas";
import type { Image } from "skia-canvas";

export interface FooterProps {
	logo: Image;
	user: User | null;
	border?: JSX.IntrinsicElements["box"]["border"];
}

export const Footer = ({ logo, user, border }: FooterProps) => {
	const margin = 8;

	let text: string;

	if (User.isNetherite(user) && user?.footer?.message) text = user.footer.message;
	else {
		const logo = User.getLogo(user);

		switch (logo) {
			case UserLogo.RUBY:
				text = "§#f5c6cds§#eaa2abt§#de7d89a§#d35967t§#cb3d4cs§#c92f40i§#c82235f§#c61429y§#b80d21.§#a4091bn§#8f0415e§#7b000ft";
				break;

			case UserLogo.AMETHYST:
				text = "§#fec1e1s§#efb4e5t§#e0a7eaa§#d19aeet§#c48ff1s§#ba88f1i§#b181f1f§#a77af1y§#9c72e9.§#9069dcn§#8560d0e§#7957c3t";
				break;

			case UserLogo.NETHERITE:
				text = "§#5d5b5ds§#575557t§#514f51a§#4b494bt§#454345s§#3e3c3ei§#373637f§#302f30y§#2d2b2c.§#2b2829n§#2a2425e§#282122t";
				break;

			case UserLogo.SCULK:
				text = "§#29bac5s§#1ea9b2t§#13989fa§#08878dt§#02777bs§#04666di§#065660f§#084552y§#083b46.§#07323cn§#062a32e§#052228t";
				break;

			case UserLogo.PINK:
				text = "§#fec0d4s§#fbb9d5t§#f9b3d6a§#f6acd7t§#f4a5d5s§#f59bcci§#f692c2f§#f788b9y§#f189c2.§#e98fd4n§#e094e7e§#d89af9t";
				break;

			case UserLogo.VENOM:
				text = "§#bb00dds§#b00fdet§#a51edfa§#9b2ce0t§#903be1s§#854ae2i§#7a59e2f§#6f68e3y§#6477e4.§#5a85e5n§#4f94e6e§#44a3e7t";
				break;

			case UserLogo.EMERALD:
				text = "§#d4ffe7s§#a8fbc5t§#7df7a3a§#51f382t§#31ee68s§#28e760i§#1fdf59f§#16d851y§#10cb46.§#0abb3bn§#05ab2fe§#009b24t";
				break;

			case UserLogo.DIAMOND:
				text = "§#cdfff4s§#bcfeeft§#aafceba§#99fbe6t§#86f9e1s§#70f4ddi§#59f0d8f§#43ebd4y§#36e1ca.§#2dd4ben§#23c7b3e§#1abaa7t";
				break;

			case UserLogo.GOLD:
				text = "§#fffddas§#fefab3t§#fdf88da§#fdf566t§#fcf04as§#fbe546i§#fadb41f§#f9d03dy§#f5c533.§#f0b928n§#eaae1ce§#e5a211t";
				break;

			case UserLogo.IRON:
				text = "§#eaeaeas§#e3e3e3t§#dcdcdca§#d5d5d5t§#cececes§#c9c9c9i§#c5c5c5f§#c0c0c0y§#b7b7b7.§#acacacn§#a2a2a2e§#979797t";
				break;

			case UserLogo.DEFAULT:
				text = "§#d0efffs§#a3d9fct§#75c2f9a§#48acf6t§#289af0s§#2391e6i§#1f87dbf§#1a7ed1y§#1777c8.§#1572c0n§#136cb9e§#1167b1t";
				break;
		}
	}

	return (
		<box width="100%" align="center" border={border}>
			<img margin={{ left: margin, top: margin / 2, bottom: margin / 2, right: margin }} image={logo} />
			<text>{text}</text>
		</box>
	);
};
