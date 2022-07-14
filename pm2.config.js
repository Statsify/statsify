/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

const cron_restart = "0 20 * * *";
const exp_backoff_restart_delay = 500;
const script = "yarn";
const with_color = "--color=16m";
const env = {
  FORCE_COLOR: 3,
  NODE_OPTIONS: "--unhandled-rejections=warn",
};

module.exports = {
  apps: [
    {
      name: "api",
      args: `api prod-start ${with_color}`,
      script,
      cron_restart,
      exp_backoff_restart_delay,
      env,
      exec_mode: "cluster",
      instances: 4,
    },
    {
      name: "discord-bot",
      args: `discord-bot start ${with_color}`,
      script,
      cron_restart,
      exp_backoff_restart_delay,
      env,
    },
    // {
    //   name: "support-bot",
    //   args: `support-bot start ${with_color}`,
    //   script,
    //   cron_restart,
    //   exp_backoff_restart_delay,
    //   env,
    // },
    {
      name: "verify-server",
      args: `verify-server start ${with_color}`,
      script,
      cron_restart,
      exp_backoff_restart_delay,
      env,
    },
    {
      name: "leaderboard-limiting",
      args: `scripts limit-redis start ${with_color}`,
      script,
      cron_restart,
      exp_backoff_restart_delay,
      env,
    },
  ],
};
