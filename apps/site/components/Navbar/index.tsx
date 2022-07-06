/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styled from "styled-components";
import { NavItem, NavItems } from "./Items";

const StyledNav = styled.nav`
  width: 100%;
  display: flex;
  background-color: red;
  color: white;
  font-family: "Lexend Deca";
  justify-content: space-between;
  align-items: center;
`;

const Branding = styled.div`
  margin: 10px;
`;

export const Navbar = () => (
  <StyledNav>
    <Branding>
      <h1>Statsify</h1>
    </Branding>
    <NavItems>
      <NavItem href="/google">About Us</NavItem>
      <NavItem href="/google">About Us</NavItem>
      <NavItem href="/google">About Us</NavItem>
      <NavItem href="/google">About Us</NavItem>
    </NavItems>
  </StyledNav>
);
