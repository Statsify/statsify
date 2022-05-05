import {
  AbstractCommandListener,
  CommandContext,
  CommandResolvable,
  ContentResponse,
  Interaction,
} from '@statsify/discord';
import { ApplicationCommandOptionType, InteractionResponseType } from 'discord-api-types/v10';
import type {
  InteractionResponse,
  InteractionServer,
  RestClient,
  WebsocketShard,
} from 'tiny-discord';
import { ApiService } from './services/api.service';

export type InteractionHook = (interaction: Interaction) => any;

export class CommandListener extends AbstractCommandListener {
  private hooks: Map<string, InteractionHook>;
  private readonly apiService: ApiService;
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

    this.apiService = new ApiService();
    this.hooks = new Map();
  }

  public addInteractionHook(id: string, hook: InteractionHook) {
    this.hooks.set(id, hook);
  }

  public removeInteractionHook(id: string) {
    this.hooks.delete(id);
  }

  public onInteraction(
    interaction: Interaction
  ): InteractionResponse | Promise<InteractionResponse> {
    if (interaction.isCommandInteraction()) return this.onCommand(interaction);
    if (interaction.isAutocompleteInteraction()) return this.onAutocomplete(interaction);
    if (interaction.isMessageComponentInteraction()) return this.onMessageComponent(interaction);

    return { type: InteractionResponseType.Pong };
  }

  private async onCommand(interaction: Interaction): Promise<InteractionResponse> {
    let data = interaction.getData();

    let command = this.commands.get(data.name);

    if (!command) return { type: InteractionResponseType.Pong };

    [command, data] = this.getCommandAndData(command, data);

    const user = await this.apiService.getUser(interaction.getUserId());

    const context = new CommandContext(interaction, data);
    context.setUser(user);

    try {
      const response = command.execute(context);

      if (response instanceof Promise)
        response
          .then((res) => {
            if (typeof res === 'object') context.reply(res);
          })
          .catch((err) => {
            if (err instanceof ContentResponse) context.reply(err);
            else this.logger.error(err);
          });
      else if (typeof response === 'object')
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: interaction.convertToApiData(response),
        };
    } catch (err) {
      if (err instanceof ContentResponse)
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: interaction.convertToApiData(err),
        };

      this.logger.error(err);
    }

    return {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
    };
  }

  private onAutocomplete(interaction: Interaction): InteractionResponse {
    let data = interaction.getData();

    let command = this.commands.get(data.name);

    if (!command) return { type: InteractionResponseType.Pong };

    [command, data] = this.getCommandAndData(command, data);

    const focusedOption = data.options.find((opt: any) => opt.focused);
    if (!focusedOption) return { type: InteractionResponseType.Pong };

    const autocompleteArg = command.args.find((opt) => opt.name === focusedOption.name);
    if (!autocompleteArg) return { type: InteractionResponseType.Pong };

    const context = new CommandContext(interaction, data);
    const response = autocompleteArg.autocompleteHandler?.(context);

    return response || { type: InteractionResponseType.Pong };
  }

  private onMessageComponent(interaction: Interaction): InteractionResponse {
    const hook = this.hooks.get(interaction.getCustomId());
    hook?.(interaction);
    return { type: InteractionResponseType.DeferredMessageUpdate };
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
