/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

module.exports = {
  apps: [
    {
      name: "Statsify API",
      script: "yarn",
      args: "api start --color=16m",
      exp_backoff_restart_delay: 500,
      cron_restart: "0 20 * * *",
      env: {
        FORCE_COLOR: 3,
      },
    },
    {
      name: "Statsify Discord Bot",
      script: "yarn",
      args: "discord-bot start --color=16m",
      exp_backoff_restart_delay: 500,
      cron_restart: "0 20 * * *",
      env: {
        FORCE_COLOR: 3,
      },
    },
    {
      name: "Statsify Support Bot",
      script: "yarn",
      args: "support-bot start --color=16m",
      exp_backoff_restart_delay: 500,
      cron_restart: "0 20 * * *",
      env: {
        FORCE_COLOR: 3,
      },
    },
    {
      name: "Statsify Verify Server",
      script: "yarn",
      args: "verify-bot start --color=16m",
      exp_backoff_restart_delay: 500,
      cron_restart: "0 20 * * *",
      env: {
        FORCE_COLOR: 3,
      },
    },
    {
      name: "Statsify Leaderboard Limiting",
      script: "yarn",
      args: "scripts limit-redis start --color=16m",
      exp_backoff_restart_delay: 500,
      cron_restart: "*/30 * * * *",
      env: {
        FORCE_COLOR: 3,
      },
    },
  ],
};
