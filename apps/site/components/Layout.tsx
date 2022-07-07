/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container } from "./Container";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { ReactNode } from "react";

export interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <>
    <Hero />
    <main>
      <Container>{children}</Container>
    </main>
    <Footer />
  </>
);
