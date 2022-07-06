/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Head from "next/head";
import { Layout } from "../components/Layout";
import { createGlobalStyle } from "styled-components";
import type { AppProps } from "next/app";

const GlobalStyle = createGlobalStyle`
   @font-face {
     font-family: "Minecraft";
     src: url('/fonts/minecraft.otf');
     font-weight: normal;
     font-style: normal;
   }

   @font-face {
     font-family: "Minecraft";
     src: url('/fonts/minecraft-bold.otf');
     font-weight: bold;
     font-style: normal;
   }

   @font-face {
     font-family: "Minecraft";
     src: url('/fonts/minecraft-italic.otf');
     font-weight: normal;
     font-style: italic;
   }

   @font-face {
     font-family: "Minecraft";
     src: url('/fonts/minecraft-bold-italic.otf');
     font-weight: bold;
     font-style: italic;
   }

   * {
    margin: 0;
    padding: 0;
   }

   html, body, #__next {
     width: 100%;
     height: 100%;
     background-color: #1d1d1d;
     font-family: "Manrope"
   }

   #__next  {
    display: flex;
    flex-direction: column;
   }

   main {
    flex: 1;
   }
 `;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Statsify</title>
        <meta content="Statsify" property="og:title" />
        <meta content="#187ccd" name="theme-color" />
      </Head>
      <GlobalStyle />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
