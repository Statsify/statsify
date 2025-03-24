/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiException } from "../exception.js";
import { Commands } from "@statsify/schemas";
import { Hono } from "hono";
import { Permissions, Policy, auth } from "../auth.js";
import { getModelForClass } from "@typegoose/typegoose";
import { validator } from "../validation.js";
import { z } from "zod";

// Store all command analytics in one mongodb document
const COMMANDS_DOCUMENT_NAME = "commands";
const CommandsModel = getModelForClass(Commands);

const CommandsNotFoundException = new ApiException(404, ["Commands Not Found"]);

export const commandsRouter = new Hono()
// Get Command Usage
  .get(
    "/",
    auth({ policy: Policy.has(Permissions.AnalyticsManage) }),
    async (c) => {
      const commands = await CommandsModel
        .findOne()
        .where("name")
        .equals(COMMANDS_DOCUMENT_NAME)
        .lean()
        .exec();

      if (!commands) throw CommandsNotFoundException;

      return c.json({ success: true, usage: commands.usage });
    })
// Increment Command Usage
  .patch(
    "/",
    auth({ policy: Policy.has(Permissions.AnalyticsManage) }),
    validator("query", z.object({ command: z.string() })),
    async (c) => {
      const { command } = c.req.valid("query");

      // This will be the name of the command with each subcommand separated by spaces
      // Example: leaderboard classic arenabrawl
      const commands = command.split(" ");

      // Increment the usage for each subcommand: leaderboard, leaderboard_classic, and leaderboard_classic_arenabrawl
      const incrementedCommands = Object.fromEntries(
        commands.map((_, index) => [`usage.${commands.slice(0, index + 1).join("_")}`, 1])
      );

      // Increment the total command usage
      incrementedCommands["usage.commands"] = 1;

      await CommandsModel
        .updateOne({ $inc: incrementedCommands }, { upsert: true })
        .where("name")
        .equals(COMMANDS_DOCUMENT_NAME)
        .lean()
        .exec();

      return c.json({ success: true });
    });
