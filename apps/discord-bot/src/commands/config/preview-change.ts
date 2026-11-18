/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { CommandContext, IMessage, LocalizationString } from "@statsify/discord";
import { confirmAction } from "#lib/confirm-action";

export function previewChange(
  context: CommandContext,
  name: string,
  profile: Buffer,
  apply: () => Promise<unknown>,
  applied: LocalizationString
): IMessage {
  return confirmAction(context, {
    prompt: {
      content: (t) => t("config.preview"),
      files: [{ name, data: profile, type: "image/png" }],
    },
    confirmLabel: (t) => t("config.apply"),
    onConfirm: async () => {
      await apply();
      return { content: applied };
    },
  });
}
