/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Config } from "tailwindcss";

export default {
	content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		colors: {
			"inherit": "inherit",
			"current": "currentColor",
			"transparent": "transparent",
			"black": "#000",
			"dark-blue": "#0000AA",
			"dark-green": "#00AA00",
			"dark-aqua": "#00AAAA",
			"dark-red": "#AA0000",
			"dark-purple": "#AA00AA",
			"gold": "#FFAA00",
			"gray": "#AAAAAA",
			"dark-gray": "#555555",
			"blue": "#5555FF",
			"green": "#55FF55",
			"aqua": "#55FFFF",
			"red": "#FF5555",
			"light-purple": "#FF55FF",
			"yellow": "#FFFF55",
			"white": "#fff",
		},
		boxShadow: {
			md: "0px 4px 16px 0px rgba(0, 0, 0, 0.25)",
		},
		fontFamily: {
			sans: ["var(--font-inter)"],
		},
	},
	plugins: [],
} satisfies Config;
