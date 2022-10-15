/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import commands from "../../discord-bot/commands.json" assert { type: "json" };

const commandChars = {};

const findLongestLocalizationLength = (localizations) =>
  Math.max(...Object.values(localizations).map((description) => description.length));

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
  const chars = [];

  const topCommandOptions = command.flatMap((option) => option.options);
  const subCommandOptions = topCommandOptions.flatMap((option) => option.options ?? []);
  const subsubCommandOptions = subCommandOptions.flatMap(
    (option) => option.options ?? []
  );

  chars.push(findOptionsLength(command));
  chars.push(findOptionsLength(topCommandOptions));
  chars.push(findOptionsLength(subCommandOptions));
  chars.push(findOptionsLength(subsubCommandOptions));
  return chars.reduce((a, b) => a + b, 0);
};

for (const command of Object.values(commands.commands)) {
  commandChars[command.name] = findTotalCommandChars([command]);
}

for (const [commandName, charCount] of Object.entries(commandChars).sort(
  (a, b) => a[1] - b[1]
)) {
  console.log(`${commandName}: ${charCount}`);
}
