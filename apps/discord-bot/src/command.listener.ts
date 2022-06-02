import { WARNING_COLOR } from '#constants';
import {
  AbstractCommandListener,
  CommandContext,
  CommandResolvable,
  Interaction,
  Message,
} from '@statsify/discord';
import { User } from '@statsify/schemas';
import { formatTime } from '@statsify/util';
import { ApplicationCommandOptionType, InteractionResponseType } from 'discord-api-types/v10';
import type {
  InteractionResponse,
  InteractionServer,
  RestClient,
  WebsocketShard,
} from 'tiny-discord';
import { ErrorMessage } from './error.message';
import { ApiService } from './services';

export type InteractionHook = (interaction: Interaction) => any;

export class CommandListener extends AbstractCommandListener {
  private hooks: Map<string, InteractionHook>;
  private cooldowns: Map<string, Map<string, number>>;
  private coreIds: string[];
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

    this.coreIds = process.env.CORE_IDS?.replace(/ /, '').split(',') ?? [];
    this.apiService = new ApiService();
    this.hooks = new Map();
    this.cooldowns = new Map();
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

    const userId = interaction.getUserId();

    [command, data] = this.getCommandAndData(command, data);

    const user = await this.apiService.getUser(userId);

    const context = new CommandContext(interaction, data);
    context.setUser(user);

    try {
      this.isOnCooldown(command, user, userId);

      const response = command.execute(context);

      if (response instanceof Promise)
        response
          .then((res) => {
            if (typeof res === 'object') context.reply(this.localize(context, new Message(res)));
          })
          .catch((err) => {
            if (err instanceof Message) context.reply(this.localize(context, err));
            else this.logger.error(err);
          });
      else if (typeof response === 'object')
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: interaction.convertToApiData(this.localize(context, new Message(response))),
        };
    } catch (err) {
      if (err instanceof Message)
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: interaction.convertToApiData(this.localize(context, err)),
        };

      this.logger.error(err);
    }

    return {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
    };
  }

  private onAutocomplete(interaction: Interaction): InteractionResponse {
    const defaultResponse = {
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data: { choices: [] },
    };

    let data = interaction.getData();

    let command = this.commands.get(data.name);

    if (!command) return defaultResponse;

    [command, data] = this.getCommandAndData(command, data);

    const focusedOption = data.options.find((opt: any) => opt.focused);
    if (!focusedOption) return defaultResponse;

    const autocompleteArg = command.args.find((opt) => opt.name === focusedOption.name);
    if (!autocompleteArg) return defaultResponse;

    const context = new CommandContext(interaction, data);
    const response = autocompleteArg.autocompleteHandler?.(context);

    return {
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data: { choices: response },
    };
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

  private localize(context: CommandContext, message: Message) {
    return message.build(context.t());
  }

  private isOnCooldown(command: CommandResolvable, user: User | null, userId: string) {
    const cooldownForCommand = this.cooldowns.get(command.name);

    let reduction = 1;

    if (this.coreIds.includes(userId)) reduction = 0;
    else if (user?.premium) reduction = 0.3;
    else if (user?.serverMember) reduction = 0.8;
    else if (user?.uuid) reduction = 0.9;

    const now = Date.now();
    const newCooldown = now + command.cooldown * 1000 * reduction;

    if (!cooldownForCommand) {
      const cooldownForCommand = new Map();
      cooldownForCommand.set(userId, newCooldown);
      this.cooldowns.set(command.name, cooldownForCommand);

      return;
    }

    const cooldown = cooldownForCommand.get(userId);

    if (!cooldown) {
      cooldownForCommand.set(userId, newCooldown);
      return;
    }

    if (now >= cooldown) {
      cooldownForCommand.set(userId, newCooldown);
      return;
    }

    throw new ErrorMessage(
      (t) => t('cooldown.title'),
      (t) => t('cooldown.description', { time: formatTime(cooldown - now), command: command.name }),
      { color: WARNING_COLOR }
    );
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
