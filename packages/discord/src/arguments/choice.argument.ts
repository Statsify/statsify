/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument } from "./abstract.argument";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { LocalizationString } from "../messages";

export type Choice = string | [display: string, value: string | number];

export class ChoiceArgument extends AbstractArgument {
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = false;

  public constructor(public name: string, ...choices: Choice[]) {
    super();

    this.description = (t) => t("arguments.choice");

    this.choices = choices.map((choice) => {
      if (typeof choice === "string") return { name: choice, value: choice };
      return { name: choice[0], value: choice[1] };
    });
  }
}
