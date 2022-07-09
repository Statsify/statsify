/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

module.exports = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  redirects() {
    return [
      {
        source: "/invite",
        destination:
          "https://discord.com/oauth2/authorize?client_id=718827787422793820&scope=applications.commands%20bot&permissions=412384021568",
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
        destination: "https://www.patreon.com/join/statsify",
        permanent: true,
      },
      {
        source: "/patreon",
        destination: "https://www.patreon.com/join/statsify",
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
      //TODO: add redirects for terms of service and privacy policy
      {
        source: "/terms",
        destination: "/",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/",
        permanent: true,
      },
      {
        source: "/_error",
        destination: "/",
        permanent: true,
      },
    ];
  },
};
