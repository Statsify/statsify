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
} from "../base.hypixel-command";
import { CHALLENGE_MODES, ChallengeModes } from "@statsify/schemas";
import { ChallengesProfile } from "./challenges.profile";
import { Command } from "@statsify/discord";

@Command({ description: (t) => t("commands.challenges") })
export class ChallengesCommand extends BaseHypixelCommand<ChallengeModes> {
  public constructor() {
    super(CHALLENGE_MODES);
  }

  public getProfile(
    base: BaseProfileProps,
    { mode }: ProfileData<ChallengeModes>
  ): JSX.Element {
    return <ChallengesProfile {...base} mode={mode} />;
  }
}
