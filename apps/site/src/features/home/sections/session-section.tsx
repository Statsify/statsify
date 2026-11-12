/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseSection } from "./base-section";
import { Command } from "~/components/ui/command";
import { PlayerProvider } from "~/components/player-context";
import { SessionAnimation } from "../session-animation";
import type { PreviewIdentity } from "@statsify/contract";

export function SessionSection({ player }: { player: PreviewIdentity }) {
  return (
    <BaseSection
      background="woolgames"
      className="flex-col xl:flex-row justify-between items-center relative"
    >
      <div className="flex flex-col gap-4 max-w-120 text-mc-white">
        <h2 className="text-mc-4 lg:text-mc-7 font-bold text-mc-yellow">
          Sessions
        </h2>
        <p className="text-mc-1.5 lg:text-mc-2 leading-[1.35] max-w-[60ch]">
          Statsify allows you to display your stats within sessions. You can
          track your stats and check your progress at the end of the day! Use
          the sessions stats with the <Command command="/session" /> command
          followed by the game of your choice, such as{" "}
          <Command command="/session woolgames" />. &quot;But my past losses?&quot; you
          might say. No worries! You can reset your session at any time
          with <Command command="/reset session" />.
        </p>
      </div>
      <PlayerProvider player={player}>
        <SessionAnimation />
      </PlayerProvider>
    </BaseSection>
  );
}
