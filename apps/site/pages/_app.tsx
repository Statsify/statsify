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
   * {
    margin: 0;
    padding: 0;
   }

   html, body, #__next {
     width: 100%;
     height: 100%;
     background-color: #1d1d1d;
     font-family: "Lexend Deca";
   }

   #__next  {
    display: flex;
    flex-direction: column;
   }

   main {
    flex: 1;
   }

   img {
    user-select: none;
   }

   .slider {
    position: relative;
   }

   .slider::before {
    content: '';
    position: absolute;
    top: 0;
    left: 100%;
    width: 10000%;
    height: 100%;
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
