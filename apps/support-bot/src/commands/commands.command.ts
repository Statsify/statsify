/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  Command,
  CommandContext,
  EmbedBuilder,
  ErrorMessage,
  PaginateService,
  TextArgument,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserTier } from "@statsify/schemas";
import { arrayGroup, prettify } from "@statsify/util";

const COMMANDS_PER_PAGE = 25;

@Command({
  description: (t) => t("commands.commands"),
  tier: UserTier.CORE,
  args: [new TextArgument("highlight", "The string to highlight", false)],
  userCommand: false,
})
export class CommandsCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const commands = await this.apiService.getCommandUsage();

    if (!commands) throw new ErrorMessage("errors.unknown");

    const totalCommands = commands.commands;
    delete commands.commands;

    const commandList = Object.entries(commands).sort((a, b) => b[1] - a[1]);
    const groups = arrayGroup(commandList, COMMANDS_PER_PAGE);

    return this.paginateService.scrollingPagination(
      context,
      groups.map(
        (group, index) => () =>
          this.createTopPage(
            index,
            group,
            totalCommands,
            context.option<string>("highlight").toLowerCase().replace(" ", "_")
          )
      )
    );
  }

  private createTopPage(
    page: number,
    commands: [commandName: string, usage: number][],
    totalCommands: number,
    highlight: string
  ) {
    const embed = new EmbedBuilder()
      .title("Commands")
      .footer(
        (t) =>
          `Total: ${t(totalCommands)}${highlight ? ` | Highlighting: ${highlight}` : ""}`
      )
      .color(STATUS_COLORS.info)
      .description((t) =>
        commands
          .map(([command, usage], index) => {
            const position = page * COMMANDS_PER_PAGE + index + 1;
            const commandName = `${command.includes(highlight) ? "**" : ""}${prettify(
              command
            )}${command.includes(highlight) ? "**" : ""}`;
            const percentage = Math.round((usage / totalCommands) * 100);

            return `\`#${String(position).padStart(
              String(page * COMMANDS_PER_PAGE + COMMANDS_PER_PAGE).length,
              "0"
            )}\` ${commandName}: **${t(usage)}** \`(${t(percentage)}%)\``;
          })
          .join("\n")
      );

    return embed;
  }
}
