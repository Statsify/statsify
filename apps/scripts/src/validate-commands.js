/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import commands from "discord-bot/commands.json" assert { type: "json" };
import z from "zod";

function toEnum(...args) {
  return z.union(args.map((arg) => z.literal(arg)));
}

const name = z.string().min(3).max(32);
const name_localizations = z.optional(z.record(name));

const description = z.string().min(1).max(100);
const description_localizations = z.optional(z.record(description));

const choicesSchema = z.object({
  // this is intentional since choice names can go up to 100 characters
  name: description,
  name_localizations: description_localizations,
  value: z.union([z.string().max(32), z.number()]),
});

const optionSchema = z.object({
  type: toEnum(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
  name,
  name_localizations,
  description,
  description_localizations,
  required: z.optional(z.boolean()),
  choices: z.optional(z.array(choicesSchema)),
  options: z.optional(z.array(z.lazy(() => optionSchema))),
  channel_types: z.optional(z.array(toEnum(0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15))),
  min_value: z.optional(z.number()),
  max_value: z.optional(z.number()),
  min_length: z.optional(z.number().min(0).max(6000)),
  max_length: z.optional(z.number().min(1).max(6000)),
  autocomplete: z.optional(z.boolean()),
});

const commandSchema = z.object({
  name,
  name_localizations,
  description,
  description_localizations,
  options: z.optional(z.array(optionSchema)),
  type: z.optional(toEnum(1, 2, 3)),
});

Object.entries(commands.commands).forEach(([commandName, command]) => {
  try {
    commandSchema.parse(command);
  } catch (e) {
    console.error(e);
    console.log(command);
    e.errors.forEach((e) => {
      console.error(e.message);
      console.error(`${command.name}.${e.path.join(".")}`);
    });
    console.error(`Command "${commandName}" is invalid.`);
    process.exit(1);
  }
});

const commandChars = {};

const findLongestLocalizationLength = (localizations) =>
  Math.max(...Object.values(localizations).map((l) => l.length));

const findOptionsLength = (options = []) =>
  options
    .map(
      (option) =>
        option.name.length +
        findLongestLocalizationLength(option.description_localizations) +
        (
          option?.choices?.map((choice) => choice.value.length + choice.name.length) ?? []
        ).reduce((a, b) => a + b, 0)
    )
    .reduce((a, b) => a + b, 0);

const findTotalCommandChars = (command) => {
  const topCommandOptions = command.flatMap((option) => option.options);
  const subCommandOptions = topCommandOptions.flatMap((option) => option.options ?? []);
  const subsubCommandOptions = subCommandOptions.flatMap(
    (option) => option.options ?? []
  );

  return (
    findOptionsLength(command) +
    findOptionsLength(topCommandOptions) +
    findOptionsLength(subCommandOptions) +
    findOptionsLength(subsubCommandOptions)
  );
};

for (const command of Object.values(commands.commands)) {
  commandChars[command.name] = findTotalCommandChars([command]);
}

for (const [commandName, charCount] of Object.entries(commandChars).sort(
  (a, b) => a[1] - b[1]
)) {
  console.log(`${commandName}: ${charCount}`);
}
