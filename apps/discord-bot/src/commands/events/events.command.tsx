/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseHypixelCommand, BaseProfileProps } from "../base.hypixel-command";
import { Command } from "@statsify/discord";
import { ElementNode } from "@statsify/rendering";
import { EventsProfile } from "./events.profile";
import { GENERAL_MODES, GeneralModes } from "@statsify/schemas";

@Command({ description: (t) => t("commands.events") })
export class EventsCommand extends BaseHypixelCommand<GeneralModes> {
  public constructor() {
    super(GENERAL_MODES);
  }

  public getProfile(base: BaseProfileProps): ElementNode {
    return <EventsProfile {...base} />;
  }
}
