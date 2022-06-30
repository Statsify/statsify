/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  AbstractCommandListener,
  CommandContext,
  CommandResolvable,
  Interaction,
} from "@statsify/discord";
import { ApiService } from "@statsify/api-client";
import { InteractionResponse, RestClient, WebsocketShard } from "tiny-discord";
import { InteractionResponseType } from "discord-api-types/v10";
import { config } from "@statsify/util";

export class CommandListener extends AbstractCommandListener {
  private readonly apiService: ApiService;
  private static instance: CommandListener;

  private constructor(
    client: WebsocketShard,
    rest: RestClient,
    commands: Map<string, CommandResolvable>
  ) {
    super(client, rest, commands, config("supportBot.applicationId"));

    this.apiService = new ApiService(config("apiClient.route"), config("apiClient.key"));
  }

  public addCommand(command: CommandResolvable) {
    this.commands.set(command.name, command);
  }

  public removeCommand(name: string) {
    this.commands.delete(name);
  }

  protected async onCommand(interaction: Interaction): Promise<InteractionResponse> {
    const parentData = interaction.getData();
    const parentCommand = this.commands.get(parentData.name)!;

    if (!parentCommand) return { type: InteractionResponseType.Pong };

    const id = interaction.getUserId();
    const [command, data] = this.getCommandAndData(parentCommand, parentData);

    const user = await this.apiService.getUser(id);

    const context = new CommandContext(this, interaction, data);
    context.setUser(user);

    return this.executeCommand(
      command,
      context,
      this.tierPrecondition.bind(this, command, user)
    );
  }

  public static create(
    client: WebsocketShard,
    rest: RestClient,
    commands: Map<string, CommandResolvable>
  ) {
    this.instance = new CommandListener(client, rest, commands);
    return this.instance;
  }

  public static getInstance() {
    if (!this.instance) throw new Error("CommandListener has not been initialized");
    return this.instance;
  }
}
