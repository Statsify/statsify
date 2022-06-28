/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, PlayerArgument } from "@statsify/discord";

@Command({ description: (t) => t("commands.force-unverify"), args: [PlayerArgument] })
export class ForceUnverifyCommand {
  public run() {
    return { content: "Hello World" };
  }
}
