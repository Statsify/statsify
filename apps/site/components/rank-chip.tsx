/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ReactNode } from "react";
import type { ColorId } from "@statsify/schemas";

type RankSize = "lg" | "md" | "sm";

interface RankChipProps {
	rank: string;
	plusColor: ColorId;
	rankColor: ColorId;
	size?: RankSize;
}

export function RankChip({ rank, plusColor, rankColor, size = "md" }: RankChipProps) {
	let scale = 1;

	switch (size) {
		case "lg":
			scale = 2;
			break;
		case "md":
			scale = 1;
			break;
		case "sm":
			scale = 0.5;
			break;
	}

	switch (rank) {
		case "PIG+++":
			return <PigPlusPlusPlusChip scale={scale} />;

		case "bMVP++":
		case "MVP++":
			return <MVPPlusPlusChip plusColor={plusColor} rankColor={rankColor} scale={scale} />;

		case "MVP+":
			return <MVPPlusChip plusColor={plusColor} scale={scale} />;

		case "VIP+":
			return <VIPPlusChip scale={scale} />;

		default:
			return (
				<BaseRank rankColor={rankColor} size={size}>
					{rank}
				</BaseRank>
			);
	}
}

interface SvgRankChipProps {
	scale: number;
}

interface MVPPlusPlusChipProps extends SvgRankChipProps {
	rankColor: ColorId;
	plusColor: ColorId;
}

const plusColors: Record<ColorId, string> = {
	BLACK: "fill-black",
	DARK_BLUE: "fill-dark-blue",
	DARK_GREEN: "fill-dark-green",
	DARK_AQUA: "fill-dark-aqua",
	DARK_RED: "fill-dark-red",
	DARK_PURPLE: "fill-dark-purple",
	GOLD: "fill-gold",
	GRAY: "fill-gray",
	DARK_GRAY: "fill-dark-gray",
	BLUE: "fill-blue",
	GREEN: "fill-green",
	AQUA: "fill-aqua",
	RED: "fill-red",
	LIGHT_PURPLE: "fill-light-purple",
	YELLOW: "fill-yellow",
	WHITE: "fill-white",
};

function MVPPlusPlusChip({ rankColor, plusColor, scale }: MVPPlusPlusChipProps) {
	const plusClass = plusColors[plusColor];
	const rankClass = plusColors[rankColor];
	const width = 93 * scale;
	const height = 30 * scale;

	return (
		<svg width={width} height={height} viewBox="0 0 93 30" fill="none" xmlns="http://www.w3.org/2000/svg">
			<mask id="path-1-inside-1_474_629" fill="white">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M61.6773 0H15C6.71573 0 0 6.71573 0 15C0 23.2843 6.71574 30 15 30H52.0077L61.6773 0Z" />
			</mask>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M61.6773 0H15C6.71573 0 0 6.71573 0 15C0 23.2843 6.71574 30 15 30H52.0077L61.6773 0Z"
				className={rankClass}
				fill-opacity="0.3"
			/>
			<path
				d="M61.6773 0L62.6291 0.306779L63.0503 -1H61.6773V0ZM52.0077 30V31H52.736L52.9594 30.3068L52.0077 30ZM15 1H61.6773V-1H15V1ZM1 15C1 7.26801 7.26801 1 15 1V-1C6.16344 -1 -1 6.16344 -1 15H1ZM15 29C7.26803 29 1 22.732 1 15H-1C-1 23.8366 6.16346 31 15 31V29ZM52.0077 29H15V31H52.0077V29ZM52.9594 30.3068L62.6291 0.306779L60.7255 -0.306779L51.0559 29.6932L52.9594 30.3068Z"
				className={rankClass}
				fill-opacity="0.75"
				mask="url(#path-1-inside-1_474_629)"
			/>
			<mask id="path-3-inside-2_474_629" fill="white">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M52.009 30L61.6787 0H77.4031C85.6874 0 92.4031 6.71573 92.4031 15C92.4031 23.2843 85.6874 30 77.4031 30H52.009Z"
				/>
			</mask>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M52.009 30L61.6787 0H77.4031C85.6874 0 92.4031 6.71573 92.4031 15C92.4031 23.2843 85.6874 30 77.4031 30H52.009Z"
				className={plusClass}
				fill-opacity="0.3"
			/>
			<path
				d="M52.009 30L51.0573 29.6932L50.6361 31H52.009V30ZM61.6787 0V-1H60.9503L60.7269 -0.306779L61.6787 0ZM52.9608 30.3068L62.6304 0.306779L60.7269 -0.306779L51.0573 29.6932L52.9608 30.3068ZM61.6787 1H77.4031V-1H61.6787V1ZM77.4031 1C85.1351 1 91.4031 7.26802 91.4031 15H93.4031C93.4031 6.16344 86.2397 -1 77.4031 -1V1ZM91.4031 15C91.4031 22.732 85.1351 29 77.4031 29V31C86.2397 31 93.4031 23.8366 93.4031 15H91.4031ZM77.4031 29H52.009V31H77.4031V29Z"
				className={plusClass}
				fill-opacity="0.75"
				mask="url(#path-3-inside-2_474_629)"
			/>
			<text fill="white" className="font-sans" font-size="16" font-weight="bold" letter-spacing="0em">
				<tspan x="11" y="21.3203">
					MVP
				</tspan>
			</text>
			<text fill="white" className="font-sans" font-size="16" font-weight="bold" letter-spacing="0em">
				<tspan x="63.3438" y="20.3203">
					++
				</tspan>
			</text>
		</svg>
	);
}

interface MVPPlusChipProps extends SvgRankChipProps {
	plusColor: ColorId;
}

function MVPPlusChip({ plusColor, scale }: MVPPlusChipProps) {
	const plusClass = plusColors[plusColor];
	const width = 82 * scale;
	const height = 30 * scale;

	return (
		<svg width={width} height={height} viewBox="0 0 82 30" fill="none" xmlns="http://www.w3.org/2000/svg">
			<mask id="path-1-inside-1_474_640" fill="white">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M61.6773 0H15C6.71573 0 0 6.71573 0 15C0 23.2843 6.71574 30 15 30H52.0077L61.6773 0Z" />
			</mask>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M61.6773 0H15C6.71573 0 0 6.71573 0 15C0 23.2843 6.71574 30 15 30H52.0077L61.6773 0Z"
				className="fill-aqua"
				fill-opacity="0.3"
			/>
			<path
				d="M61.6773 0L62.6291 0.306779L63.0503 -1H61.6773V0ZM52.0077 30V31H52.736L52.9594 30.3068L52.0077 30ZM15 1H61.6773V-1H15V1ZM1 15C1 7.26801 7.26801 1 15 1V-1C6.16344 -1 -1 6.16344 -1 15H1ZM15 29C7.26803 29 1 22.732 1 15H-1C-1 23.8366 6.16346 31 15 31V29ZM52.0077 29H15V31H52.0077V29ZM52.9594 30.3068L62.6291 0.306779L60.7255 -0.306779L51.0559 29.6932L52.9594 30.3068Z"
				className="fill-aqua"
				fill-opacity="0.75"
				mask="url(#path-1-inside-1_474_640)"
			/>
			<mask id="path-3-inside-2_474_640" fill="white">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M52.0093 30L61.6789 0H66.4034C74.6876 0 81.4034 6.71573 81.4034 15C81.4034 23.2843 74.6876 30 66.4034 30H52.0093Z"
				/>
			</mask>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M52.0093 30L61.6789 0H66.4034C74.6876 0 81.4034 6.71573 81.4034 15C81.4034 23.2843 74.6876 30 66.4034 30H52.0093Z"
				className={plusClass}
				fill-opacity="0.3"
			/>
			<path
				d="M52.0093 30L51.0575 29.6932L50.6363 31H52.0093V30ZM61.6789 0V-1H60.9506L60.7271 -0.306779L61.6789 0ZM52.9611 30.3068L62.6307 0.306779L60.7271 -0.306779L51.0575 29.6932L52.9611 30.3068ZM61.6789 1H66.4034V-1H61.6789V1ZM66.4034 1C74.1353 1 80.4034 7.26802 80.4034 15H82.4034C82.4034 6.16344 75.2399 -1 66.4034 -1V1ZM80.4034 15C80.4034 22.732 74.1354 29 66.4034 29V31C75.2399 31 82.4034 23.8366 82.4034 15H80.4034ZM66.4034 29H52.0093V31H66.4034V29Z"
				className={plusClass}
				fill-opacity="0.75"
				mask="url(#path-3-inside-2_474_640)"
			/>
			<text fill="white" className="font-sans" font-size="16" font-weight="bold" letter-spacing="0em">
				<tspan x="11" y="21.3203">
					MVP
				</tspan>
			</text>
			<text fill="white" className="font-sans" font-size="16" font-weight="bold" letter-spacing="0em">
				<tspan x="63.1719" y="20.3203">
					+
				</tspan>
			</text>
		</svg>
	);
}

function VIPPlusChip({ scale }: SvgRankChipProps) {
	const width = 72 * scale;
	const height = 30 * scale;

	return (
		<svg width={width} height={height} viewBox="0 0 72 30" fill="none" xmlns="http://www.w3.org/2000/svg">
			<mask id="path-1-inside-1_474_650" fill="white">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M51.6773 0H15C6.71573 0 0 6.71573 0 15C0 23.2843 6.71574 30 15 30H42.0077L51.6773 0Z" />
			</mask>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M51.6773 0H15C6.71573 0 0 6.71573 0 15C0 23.2843 6.71574 30 15 30H42.0077L51.6773 0Z"
				className="fill-green"
				fill-opacity="0.3"
			/>
			<path
				d="M51.6773 0L52.6291 0.306779L53.0503 -1H51.6773V0ZM42.0077 30V31H42.736L42.9594 30.3068L42.0077 30ZM15 1H51.6773V-1H15V1ZM1 15C1 7.26801 7.26801 1 15 1V-1C6.16344 -1 -1 6.16344 -1 15H1ZM15 29C7.26803 29 1 22.732 1 15H-1C-1 23.8366 6.16346 31 15 31V29ZM42.0077 29H15V31H42.0077V29ZM42.9594 30.3068L52.6291 0.306779L50.7255 -0.306779L41.0559 29.6932L42.9594 30.3068Z"
				className="fill-green"
				fill-opacity="0.75"
				mask="url(#path-1-inside-1_474_650)"
			/>
			<mask id="path-3-inside-2_474_650" fill="white">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M42.0093 30L51.6789 0H56.4034C64.6876 0 71.4034 6.71573 71.4034 15C71.4034 23.2843 64.6876 30 56.4034 30H42.0093Z"
				/>
			</mask>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M42.0093 30L51.6789 0H56.4034C64.6876 0 71.4034 6.71573 71.4034 15C71.4034 23.2843 64.6876 30 56.4034 30H42.0093Z"
				className="fill-gold"
				fill-opacity="0.3"
			/>
			<path
				d="M42.0093 30L41.0575 29.6932L40.6363 31H42.0093V30ZM51.6789 0V-1H50.9506L50.7271 -0.306779L51.6789 0ZM42.9611 30.3068L52.6307 0.306779L50.7271 -0.306779L41.0575 29.6932L42.9611 30.3068ZM51.6789 1H56.4034V-1H51.6789V1ZM56.4034 1C64.1353 1 70.4034 7.26802 70.4034 15H72.4034C72.4034 6.16344 65.2399 -1 56.4034 -1V1ZM70.4034 15C70.4034 22.732 64.1354 29 56.4034 29V31C65.2399 31 72.4034 23.8366 72.4034 15H70.4034ZM56.4034 29H42.0093V31H56.4034V29Z"
				className="fill-gold"
				fill-opacity="0.75"
				mask="url(#path-3-inside-2_474_650)"
			/>
			<text fill="white" className="font-sans" font-size="16" font-weight="bold" letter-spacing="0em">
				<tspan x="11" y="21.3203">
					VIP
				</tspan>
			</text>
			<text fill="white" className="font-sans" font-size="16" font-weight="bold" letter-spacing="0em">
				<tspan x="53.1719" y="20.3203">
					+
				</tspan>
			</text>
		</svg>
	);
}

function PigPlusPlusPlusChip({ scale }: SvgRankChipProps) {
	const width = 93 * scale;
	const height = 30 * scale;

	return (
		<svg width={width} height={height} viewBox="0 0 93 30" fill="none" xmlns="http://www.w3.org/2000/svg">
			<mask id="path-1-inside-1_471_598" fill="white">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M51.6773 0H15C6.71573 0 0 6.71573 0 15C0 23.2843 6.71574 30 15 30H42.0077L51.6773 0Z" />
			</mask>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M51.6773 0H15C6.71573 0 0 6.71573 0 15C0 23.2843 6.71574 30 15 30H42.0077L51.6773 0Z"
				className="fill-light-purple"
				fill-opacity="0.3"
			/>
			<path
				d="M51.6773 0L52.6291 0.306779L53.0503 -1H51.6773V0ZM42.0077 30V31H42.736L42.9594 30.3068L42.0077 30ZM15 1H51.6773V-1H15V1ZM1 15C1 7.26801 7.26801 1 15 1V-1C6.16344 -1 -1 6.16344 -1 15H1ZM15 29C7.26803 29 1 22.732 1 15H-1C-1 23.8366 6.16346 31 15 31V29ZM42.0077 29H15V31H42.0077V29ZM42.9594 30.3068L52.6291 0.306779L50.7255 -0.306779L41.0559 29.6932L42.9594 30.3068Z"
				className="fill-light-purple"
				fill-opacity="0.75"
				mask="url(#path-1-inside-1_471_598)"
			/>
			<mask id="path-3-inside-2_471_598" fill="white">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M42.0078 30L51.6774 0H77.4031C85.6874 0 92.4031 6.71573 92.4031 15C92.4031 23.2843 85.6874 30 77.4031 30H42.0078Z"
				/>
			</mask>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M42.0078 30L51.6774 0H77.4031C85.6874 0 92.4031 6.71573 92.4031 15C92.4031 23.2843 85.6874 30 77.4031 30H42.0078Z"
				className="fill-aqua"
				fill-opacity="0.3"
			/>
			<path
				d="M42.0078 30L41.056 29.6932L40.6348 31H42.0078V30ZM51.6774 0V-1H50.9491L50.7257 -0.306779L51.6774 0ZM42.9596 30.3068L52.6292 0.306779L50.7257 -0.306779L41.056 29.6932L42.9596 30.3068ZM51.6774 1H77.4031V-1H51.6774V1ZM77.4031 1C85.1351 1 91.4031 7.26802 91.4031 15H93.4031C93.4031 6.16344 86.2396 -1 77.4031 -1V1ZM91.4031 15C91.4031 22.732 85.1351 29 77.4031 29V31C86.2397 31 93.4031 23.8366 93.4031 15H91.4031ZM77.4031 29H42.0078V31H77.4031V29Z"
				className="fill-aqua"
				fill-opacity="0.75"
				mask="url(#path-3-inside-2_471_598)"
			/>
			<text fill="white" className="" font-size="16" font-weight="bold" letter-spacing="0em">
				<tspan x="11" y="21.3203">
					PIG
				</tspan>
			</text>
			<text fill="white" className="" font-size="16" font-weight="bold" letter-spacing="0em">
				<tspan x="52.5156" y="20.3203">
					+++
				</tspan>
			</text>
		</svg>
	);
}

interface BaseRankProps {
	children: ReactNode;
	rankColor: ColorId;
	size: RankSize;
}

const baseRankColors: Record<ColorId, string> = {
	BLACK: "bg-black/30 outline-black/75",
	DARK_BLUE: "bg-dark-blue/30 outline-dark-blue/75",
	DARK_GREEN: "bg-dark-green/30 outline-dark-green/75",
	DARK_AQUA: "bg-dark-aqua/30 outline-dark-aqua/75",
	DARK_RED: "bg-dark-red/30 outline-dark-red/75",
	DARK_PURPLE: "bg-dark-purple/30 outline-dark-purple/75",
	GOLD: "bg-gold/30 outline-gold/75",
	GRAY: "bg-gray/30 outline-gray/75",
	DARK_GRAY: "bg-dark-gray/30 outline-dark-gray/75",
	BLUE: "bg-blue/30 outline-blue/75",
	GREEN: "bg-green/30 outline-green/75",
	AQUA: "bg-aqua/30 outline-aqua/75",
	RED: "bg-red/30 outline-red/75",
	LIGHT_PURPLE: "bg-light-purple/30 outline-light-purple/75",
	YELLOW: "bg-yellow/30 outline-yellow/75",
	WHITE: "bg-white/30 outline-white/75",
};

function BaseRank({ children, rankColor, size }: BaseRankProps) {
	const color = baseRankColors[rankColor];

	let sizeClass;

	switch (size) {
		case "lg":
			sizeClass = "text-[32px] h-[60px] px-6 outline-[2px] outline-offset-[-2px]";
			break;
		case "md":
			sizeClass = "text-lg h-[30px] px-3 outline-[1.5px] outline-offset-[-1.5px]";
			break;
		case "sm":
			sizeClass = "text-[8px] h-[15px] px-1.5 outline-[0.75px] outline-offset-[-0.75px]";
			break;
	}

	return (
		<div className={`${color} ${sizeClass} flex w-min items-center justify-center rounded-full bg-red/30 font-bold uppercase outline`}>
			{children}
		</div>
	);
}
