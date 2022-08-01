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
        ["Reset", "reset"],
        // ["Danish", "da"],
        // ["German", "de"],
        ["English, US", "en-US"],
        // ["Spanish", "es-ES"],
        ["Français", "fr"],
        // ["Croatian", "hr"],
        // ["Italian", "it"],
        // ["Lithuanian", "lt"],
        // ["Hungarian", "hu"],
        ["Nederlands", "nl"],
        // ["Norwegian", "no"],
        // ["Polish", "pl"],
        // ["Portuguese", "pt-BR"],
        // ["Romanian", "ro"],
        // ["Finnish", "fi"],
        // ["Swedish", "sv-SE"],
        // ["Vietnamese", "vi"],
        // ["Turkish", "tr"],
        // ["Czech", "cs"],
        // ["Greek", "el"],
        // ["Bulgarian", "bg"],
        // ["Russian", "ru"],
        // ["Ukrainian", "uk"],
        // ["Hindi", "hi"],
        // ["Thai", "th"],
        ["中文", "zh-CN"],
        // ["Japanese", "ja"],
        // ["Korean", "ko"],
      ],
    }),
  ],
})
export class LanguageCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();
    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    let locale = context.option<string | null>("language");
    if (locale === "reset") locale = null;

    await this.apiService.updateUser(user.id, { locale });

    const interaction = context.getInteraction();
    interaction.setLocale(locale);

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.success)
      .description((t) =>
        t("config.language.description", { locale: interaction.getLocale() })
      );

    return { embeds: [embed] };
  }
}
