/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Head from "next/head";
import { Layout } from "../components/Layout";
import "../globals.scss";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Statsify</title>
        <meta content="Statsify" property="og:title" />
        <meta property="site_name" content="Statsify" />

        <meta
          property="description"
          name="description"
          content="Hypixel Stats Visualized"
        />

        <meta name="summary" content="Hypixel Stats Visualized" />
        <meta
          content="statsify, hypixel bot, hypixel, hypixel network, statsify overlay, statsify bot, bw overlay, bw, hystats, hypixel bedwars bot, bedwars, bedwars overlay, hypixel overlay, stats overlay, hypixel stats bot, statisfy, discord bot, hypixel leaderboards"
          name="keywords"
        />

        <meta content="#187ccd" name="theme-color" />

        <link rel="shortcut icon" href="/images/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon-16x16.png"
        />

        <meta property="og:image" content="/embed-banner.png" />

        <meta httpEquiv="content-language" content="en" />
        <meta charSet="utf8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Statsify" />
        <meta name="publisher" content="Statsify" />
        <meta name="topic" content="Minecraft" />
        <meta name="copyright" content="Statsify" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
