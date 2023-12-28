/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SearchSm } from "~/icons/search-sm";
import { twMerge } from "tailwind-merge";

export interface SearchProperties {
	className?: string;
}

export function Search({ className }: SearchProperties) {
	return (
		<div className={twMerge("flex items-center focus-within:text-white text-white/70", className)}>
			<input
				id="input"
				type="text"
				autoComplete="off"
				spellCheck="false"
				placeholder="Search"
				className="w-full rounded-3xl bg-white/20 py-6 pl-16 pr-5 text-2xl font-semibold shadow-md outline outline-2 outline-offset-[-2px] outline-white/15 backdrop-blur-2xl placeholder:text-white/50"
			/>
			<SearchSm className="absolute ml-5" />
		</div>
	);
}
