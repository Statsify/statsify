/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SearchSm } from "~/icons/search-sm";

export function Search() {
  return (
    <div className="w-full flex items-center focus-within:text-white text-white/70 ">
      <input
        id="input"
        type="text"
        autoComplete="off"
        spellCheck="false"
        placeholder="Search a Player, Guild, or Leaderboard"
        className="bg-white/20 w-full py-6 pl-16 pr-5 rounded-3xl backdrop-blur-2xl outline outline-2 outline-white/15 outline-offset-[-2px] shadow-md font-semibold text-2xl placeholder-white/50 decoration"
      />
      <SearchSm className="absolute ml-5"/>
    </div>
  );
}
