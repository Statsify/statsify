import {
  AbstractCommandListener,
  CommandContext,
  CommandResolvable,
  Interaction,
} from '@statsify/discord';
import { ApplicationCommandOptionType, InteractionResponseType } from 'discord-api-types/v10';
import type {
  InteractionResponse,
  InteractionServer,
  RestClient,
  WebsocketShard,
} from 'tiny-discord';

export type InteractionHook = (interaction: Interaction) => any;

export class CommandListener extends AbstractCommandListener {
  private hooks: Map<string, InteractionHook>;
  private static instance: CommandListener;

  private constructor(
    client: WebsocketShard | InteractionServer,
    rest: RestClient,
    private commands: Map<string, CommandResolvable>
  ) {
    super(
      client as InteractionServer,
      rest,
      process.env.DISCORD_BOT_APPLICATION_ID,
      process.env.DISCORD_BOT_PORT as number
    );

    this.hooks = new Map();
  }

  public addInteractionHook(id: string, hook: InteractionHook) {
    this.hooks.set(id, hook);
  }

  public removeInteractionHook(id: string) {
    this.hooks.delete(id);
  }

  public onInteraction(interaction: Interaction): InteractionResponse {
    if (interaction.isCommandInteraction()) return this.onCommand(interaction);

    if (interaction.isMessageComponentInteraction()) {
      const hook = this.hooks.get(interaction.getCustomId());

      hook?.(interaction);

      return { type: InteractionResponseType.DeferredMessageUpdate };
    }

    return { type: InteractionResponseType.Pong };
  }

  public onCommand(interaction: Interaction): InteractionResponse {
    let data = interaction.getData();

    let command = this.commands.get(data.name);

    if (!command) return { type: InteractionResponseType.Pong };

    [command, data] = this.getCommandAndData(command, data);

    const context = new CommandContext(interaction, data);

    const response = command.execute(context);

    if (response instanceof Promise) {
      response.then((res) => {
        if (typeof res === 'object') context.reply(res);
      });
    } else if (typeof response === 'object')
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: interaction.convertToApiData(response),
      };

    return {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
    };
  }

  private getCommandAndData(
    command: CommandResolvable,
    data: any
  ): [command: CommandResolvable, data: any] {
    if (!data.options || !data.options.length) return [command, data];

    const firstOption = data.options[0];

    const hasSubCommandGroup = firstOption.type === ApplicationCommandOptionType.SubcommandGroup;
    const findCommand = () => command.options?.find((opt) => opt.name === firstOption.name);

    if (hasSubCommandGroup) {
      const group = findCommand();
      if (!group) return [command, data];
      return this.getCommandAndData(group, firstOption);
    }

    const hasSubCommand = firstOption.type === ApplicationCommandOptionType.Subcommand;

    if (hasSubCommand) {
      const subcommand = findCommand();
      if (!subcommand) return [command, data];
      return [subcommand, firstOption];
    }

    return [command, data];
  }

  public static create(
    client: WebsocketShard | InteractionServer,
    rest: RestClient,
    commands: Map<string, CommandResolvable>
  ) {
    this.instance = new CommandListener(client, rest, commands);
    return this.instance;
  }

  public static getInstance() {
    return this.instance;
  }
}
