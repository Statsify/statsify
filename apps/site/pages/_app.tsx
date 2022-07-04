/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Head from "next/head";
import { createGlobalStyle } from "styled-components";
import type { AppProps } from "next/app";

const GlobalStyle = createGlobalStyle`
   @font-face {
     font-family: "Minecraft";
     src: url('../public/minecraft.otf');
     font-weight: normal;
     font-style: normal;
   }

   @font-face {
     font-family: "Minecraft";
     src: url('../public/minecraft-bold.otf');
     font-weight: bold;
     font-style: normal;
   }

   @font-face {
     font-family: "Minecraft";
     src: url('../public/minecraft-italic.otf');
     font-weight: normal;
     font-style: italic;
   }

   @font-face {
     font-family: "Minecraft";
     src: url('../public/minecraft-bold-italic.otf');
     font-weight: bold;
     font-style: italic;
   }

   html, body {
     margin: 0;
     padding: 0;
     width: 100%;
     height: 100%;
     background-color: #1d1d1d;
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
      <Component {...pageProps} />
    </>
  );
}
