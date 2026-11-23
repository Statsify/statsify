/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

const cron_restart = "0 20 * * *";
const exp_backoff_restart_delay = 500;
const script = "pnpm";
const with_color = "--color=16m";
const interpreter = "/bin/bash";
const env = {
  FORCE_COLOR: 3,
  NODE_OPTIONS: "--unhandled-rejections=warn",
};

module.exports = {
  apps: [
    {
      name: "api",
      args: `api start ${with_color}`,
      script,
      cron_restart,
      exp_backoff_restart_delay,
      interpreter,
      env,
    },
    {
      name: "discord-bot",
      args: `discord-bot start ${with_color}`,
      script,
      cron_restart,
      exp_backoff_restart_delay,
      interpreter,
      env,
    },
    {
      name: "support-bot",
      args: `support-bot start ${with_color}`,
      script,
      cron_restart,
      exp_backoff_restart_delay,
      interpreter,
      env,
    },
    {
      name: "verify-server",
      args: `verify-server start ${with_color}`,
      script,
      cron_restart,
      exp_backoff_restart_delay,
      interpreter,
      env,
    },
    {
      name: "site",
      args: `site start ${with_color}`,
      script,
      // Five minutes after the API's restart, so the site's first requests find the API up.
      cron_restart: "5 20 * * *",
      exp_backoff_restart_delay,
      interpreter,
      // On pm2's SIGINT the site finishes the requests it is serving, for at most SERVER_SHUTDOWN_TIMEOUT seconds,
      // then closes its render workers and Redis and exits, about a second after the last response. pm2's default
      // 1.6 s before SIGKILL would cut that short.
      kill_timeout: 5000,
      env: { ...env, PORT: 3100, HOST: "127.0.0.1", SERVER_SHUTDOWN_TIMEOUT: 3 },
    },
    {
      name: "leaderboard-limiting",
      args: `scripts limit-redis start ${with_color}`,
      script,
      cron_restart,
      exp_backoff_restart_delay,
      interpreter,
      env,
    },
  ],
};
