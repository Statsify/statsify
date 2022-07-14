/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { IMessage } from "@statsify/discord";
import { User } from "@statsify/schemas";

export interface Tip {
  message: IMessage;

  /**
   * A list of commands that this tip cannot be used on
   */
  disabled?: string[];

  /**
   * Whether or not the user is uneligible to receive this tip.
   */
  uneligible?: (user: User | null) => boolean;
}

export const tips: Tip[] = [
  {
    message: { content: (t) => t("tips.discord") },
    uneligible: (user) => Boolean(user?.serverMember),
  },
  {
    message: { content: (t) => t("tips.verify") },
    uneligible: (user) => Boolean(user?.uuid),
    disabled: ["verify"],
  },
  { message: { content: (t) => t("tips.premium") } },
  { message: { content: (t) => t("tips.invite") } },
];
