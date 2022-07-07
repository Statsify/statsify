/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/future/image";
import Link from "next/link";
import styled from "styled-components";
import { Logo } from "./Logo";

const StyledFooter = styled.footer`
  width: 100%;
  background-color: #111111;
  color: #ffffff;
  font-family: "Lexend Deca";
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterSocials = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;

  margin-bottom: 10px;
`;

const FooterLink = styled.div`
  margin-left: 8px;
  margin-right: 8px;

  margin-top: 4px;
  margin-bottom: 4px;

  text-align: center;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const FooterLinks = styled(FooterSocials)`
  margin-bottom: 32px;

  @media only screen and (max-device-width: 480px) {
    flex-direction: column;
  }
`;

export const Footer = () => (
  <StyledFooter>
    <Logo width={200} height={75} />
    <FooterSocials>
      <Link href="/">
        <FooterLink>
          <Image src="/socials/discord.svg" width={32} height={32} />
        </FooterLink>
      </Link>
      <Link href="/">
        <FooterLink>
          <Image src="/socials/github.png" width={32} height={32} />
        </FooterLink>
      </Link>
      <Link href="/">
        <FooterLink>
          <Image src="/socials/patreon.png" width={32} height={32} />
        </FooterLink>
      </Link>
      <Link href="/">
        <FooterLink>
          <Image src="/socials/twitter.svg" width={32} height={32} />
        </FooterLink>
      </Link>
    </FooterSocials>
    <FooterLinks>
      <Link href="/">
        <FooterLink>Premium</FooterLink>
      </Link>
      <Link href="/">
        <FooterLink>Support</FooterLink>
      </Link>
      <Link href="/">
        <FooterLink>Terms of Service</FooterLink>
      </Link>
      <Link href="/">
        <FooterLink>Privacy Policy</FooterLink>
      </Link>
    </FooterLinks>
  </StyledFooter>
);
