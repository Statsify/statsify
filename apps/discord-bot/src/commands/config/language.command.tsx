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
        ["English, US (English, US)", "en-US"],
        ["中文 (Chinese, China)", "zh-CN"],
        ["繁體中文 (Chinese, Taiwan)", "zh-TW"],
        // ["Čeština (Czech)", "cs"],
        ["Nederlands (Dutch)", "nl"],
        ["Suomi (Finnish)", "fi"],
        ["Français (French)", "fr"],
        ["Deutsch (German)", "de"],
        ["Ελληνικά (Greek)", "el"],
        ["Magyar (Hungarian)", "hu"],
        ["Italiano (Italian)", "it"],
        ["Norsk (Norwegian)", "no"],
        ["Polski (Polish)", "pl"],
        ["Português do Brasil (Portuguese, Brazilian)", "pt-BR"],
        // ["Română (Romanian, Romania)", "ro"],
        // ["Pусский (Russian)", "ru"],
        // ["Español (Spanish)", "es-ES"],
        ["Svenska (Swedish)", "sv-SE"],
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
