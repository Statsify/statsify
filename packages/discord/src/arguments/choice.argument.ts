/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { AbstractArgument } from "./abstract.argument.js";
import { LocalizationString } from "#messages";

export type Choice = string | [display: string, value: string | number];

export interface ChoiceArgumentOptions {
  choices: Choice[];
  name: string;
  required?: boolean;
  type?: ApplicationCommandOptionType;
}

export class ChoiceArgument extends AbstractArgument {
  public name: string;
  public description: LocalizationString;
  public type: ApplicationCommandOptionType;
  public required: boolean;
  public choices: APIApplicationCommandOptionChoice[];

  public constructor({
    name,
    choices,
    required = true,
    type = ApplicationCommandOptionType.String,
  }: ChoiceArgumentOptions) {
    super();

    this.name = name;
    this.required = required;
    this.type = type || ApplicationCommandOptionType.String;
    this.description = t => t("arguments.choice");

    this.choices = choices.map((choice) => {
      if (typeof choice === "string") return { name: choice, value: choice };
      return { name: choice[0], value: choice[1] };
    });
  }
}
