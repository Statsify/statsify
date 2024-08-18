/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  BaseHypixelCommand,
  BaseProfileProps,
  ProfileData,
} from "#commands/base.hypixel-command";
import { Command } from "@statsify/discord";
import { PARTY_GAMES_MODES, PartyGamesModes } from "@statsify/schemas";
import { PartyGamesProfile } from "./party-game.profile.js";

@Command({ description: (t) => t("commands.party-games") })
export class PartyGamesCommand extends BaseHypixelCommand<PartyGamesModes> {
  public constructor() {
    super(PARTY_GAMES_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<PartyGamesModes>
  ): JSX.Element {
    return <PartyGamesProfile {...base} mode={mode} />;
  }
}
