/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  type APIApplicationCommandInteractionDataBasicOption,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { User } from "@statsify/schemas";
import { noop } from "@statsify/util";
import type { AbstractCommandListener } from "./abstract-command.listener.js";
import type { IMessage, LocalizeFunction, Message } from "#messages";
import type { Interaction } from "#interaction";

export class CommandContext {
  private user: User | null;

  public constructor(
    private readonly listener: AbstractCommandListener,
    private readonly interaction: Interaction,
    private readonly data: any
  ) {
    this.user = null;
  }

  public getListener() {
    return this.listener;
  }

  public getUser() {
    return this.user;
  }

  public setUser(user: User | null) {
    this.user = user;
    if (user?.locale) this.interaction.setLocale(user?.locale);
  }

  public option<T>(name: string, defaultValue?: T): T {
    const data = (
      this.data.options as APIApplicationCommandInteractionDataBasicOption[]
    )?.find((o) => o.name === name);

    if (!data) {
      return defaultValue ?? noop();
    }

    if (data.type === ApplicationCommandOptionType.Attachment) {
      return this.getInteraction().getData().resolved.attachments[data.value];
    }

    return data.value as unknown as T;
  }

  public t(): LocalizeFunction {
    return this.interaction.t();
  }

  public reply(data: Message | IMessage) {
    return this.interaction.editReply(data);
  }

  public getInteraction() {
    return this.interaction;
  }
}
