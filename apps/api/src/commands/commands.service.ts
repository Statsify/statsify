/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectModel, type MongoModel } from "#mongo";
import { CommandsSchema } from "@statsify/schemas";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommandsService {
  public constructor(
    @InjectModel(CommandsSchema)
    private readonly commandsModel: MongoModel<typeof CommandsSchema>
  ) {}

  public async incrementCommandRun(command: string) {
    const commands = command.split(" ");

    const incrementedCommands = Object.fromEntries(
      commands.map((_, index) => [`usage.${commands.slice(0, index + 1).join("_")}`, 1])
    );

    incrementedCommands["usage.commands"] = 1;

    await this.commandsModel
      .updateOne({ name: "commands" }, { $inc: incrementedCommands }, { upsert: true })
      .lean()
      .exec();
  }

  public async getCommandUsage() {
    const commands = await this.commandsModel.findOne({ name: "commands" }).lean().exec();

    if (!commands) return { commands: 0 };

    return commands.usage;
  }
}
