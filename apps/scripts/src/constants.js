import chalk from 'chalk';
import inquirer from 'inquirer';
export const inquirerLogger = (title, message, newLine = true) => {
  console.log(
    `${newLine ? '\n' : ''}${chalk.magenta('!')} ${chalk.bold(title)} ${chalk.magenta(message)}`
  );
};

export const inquirerConfirmation = async (message = 'Are you sure?', selected = false) =>
  (
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmation',
        message,
        default: selected,
      },
    ])
  ).confirmation;
