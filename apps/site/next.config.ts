/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["mongoose"],
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.statsify.net",
      },
      {
        protocol: "http",
        hostname: "localhost:3000",
      },
    ],
  },
  redirects: async () => [
    {
      source: "/invite",
      destination: "https://discord.com/oauth2/authorize?client_id=718827787422793820&scope=applications.commands%20bot&permissions=412384021568",
      permanent: true,
    },
    {
      source: "/discord",
      destination: "https://discord.gg/5VgxMQY",
      permanent: true,
    },
    {
      source: "/support",
      destination: "https://discord.gg/ZnV3VcHyEJ",
      permanent: true,
    },
    {
      source: "/premium",
      destination: "https://www.patreon.com/statsify",
      permanent: true,
    },
    {
      source: "/patreon",
      destination: "https://www.patreon.com/statsify",
      permanent: true,
    },
    {
      source: "/donate",
      destination: "https://www.patreon.com/statsify",
      permanent: true,
    },
    {
      source: "/github",
      destination: "https://github.com/Statsify/statsify",
      permanent: true,
    },
    {
      source: "/twitter",
      destination: "https://twitter.com/statsifybot",
      permanent: true,
    },
    {
      source: "/terms",
      destination: "https://j4cobi.notion.site/Statsify-Terms-of-Service-0482207df97f4f41909594241cd0b381",
      permanent: true,
    },
    {
      source: "/privacy",
      destination: "https://j4cobi.notion.site/Statsify-Privacy-Policy-2e636dcacf1e4237b35d7d2ce2d53613",
      permanent: true,
    },
    {
      source: "/translate",
      destination: "https://crowdin.com/project/statsify",
      permanent: true,
    },
  ],
};

export default nextConfig;
