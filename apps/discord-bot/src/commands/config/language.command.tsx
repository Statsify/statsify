/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  ChoiceArgument,
  Command,
  CommandContext,
  EmbedBuilder,
  ErrorMessage,
  IMessage,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";

@Command({
  description: (t) => t("commands.language"),
  args: [
    new ChoiceArgument({
      name: "language",
      required: true,
      choices: [
        ["English", "en-US"],
        ["Dutch", "nl"],
      ],
    }),
  ],
})
export class LanguageCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();
    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    const locale = context.option<string>("language");

    await this.apiService.updateUser(user.id, { locale });

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.success)
      .description((t) => t("config.language.description", { locale }));

    context.getInteraction().setLocale(locale);

    return { embeds: [embed] };
  }
}
