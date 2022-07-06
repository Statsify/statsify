/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styled from "styled-components";
import { Logo } from "../Logo";

const StyledNavbar = styled.nav`
  display: flex;
  flex-direction: row;
  justify-content: center;

  width: 100%;
`;

const Branding = styled.div`
  filter: drop-shadow(0px 0px 15px rgba(0, 0, 0, 0.8));
`;

export const Navbar = () => (
  <StyledNavbar>
    <Branding>
      <Logo />
    </Branding>
  </StyledNavbar>
);
