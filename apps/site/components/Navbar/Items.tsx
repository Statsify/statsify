/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Link from "next/link";
import styled from "styled-components";
import { Box } from "../Box";

const StyledNavLink = styled.a`
  color: #ffffff;
`;

export interface NavItemProps {
  children: React.ReactNode;
  href: string;
}

export const NavItem = ({ href, children }: NavItemProps) => (
  <li>
    <Box>
      <Link href={href}>
        <StyledNavLink>{children}</StyledNavLink>
      </Link>
    </Box>
  </li>
);

export const NavItems = styled.ul`
  list-style-type: none;
  margin: 10px;
  padding: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`;
