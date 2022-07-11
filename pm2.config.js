/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

const node_args = ["--unhandled-rejections=warn"];
const cron_restart = "0 20 * * *";
const exp_backoff_restart_delay = 500;
const script = "yarn";
const env = { FORCE_COLOR: 3 };
const with_color = "--color=16m";

module.exports = {
  apps: [
    {
      name: "Statsify API",
      args: `api start ${with_color}`,
      script,
      node_args,
      cron_restart,
      exp_backoff_restart_delay,
      env,
    },
    {
      name: "Statsify Discord Bot",
      args: `discord-bot start ${with_color}`,
      script,
      node_args,
      cron_restart,
      exp_backoff_restart_delay,
      env,
    },
    {
      name: "Statsify Support Bot",
      args: `support-bot start ${with_color}`,
      script,
      node_args,
      cron_restart,
      exp_backoff_restart_delay,
      env,
    },
    {
      name: "Statsify Verify Server",
      args: `verify-bot start ${with_color}`,
      script,
      node_args,
      cron_restart,
      exp_backoff_restart_delay,
      env,
    },
    {
      name: "Statsify Leaderboard Limiting",
      args: `scripts limit-redis start ${with_color}`,
      cron_restart: "*/30 * * * *",
      script,
      node_args,
      exp_backoff_restart_delay,
      env,
    },
  ],
};
