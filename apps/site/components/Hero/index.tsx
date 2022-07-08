/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import Typed from "react-typed";
import heroImage from "../../public/hero.png";
import styled from "styled-components";
import { Button } from "../Button";
import { Divider } from "../Divider";
import { Navbar } from "./Navbar";

const StyledHero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  width: 100%;
  min-height: 70vh;

  color: #ffffff;
  text-align: center;
  text-shadow: 2px 2px rgba(0, 0, 0, 0.4);

  @media (max-width: 640px) {
    min-height: 95vh;
  }

  > span img {
    filter: blur(10px) brightness(80%);
  }
`;

const HeroContent = styled.div`
  position: absolute;
  z-index: 1;
`;

const HeroHeader = styled.p`
  font-weight: 800;
  font-size: 2.5rem;
  text-align: center;
  margin: 8px;
`;

const HeroDescription = styled.div`
  font-weight: 600;
  font-size: 1.5rem;
  margin: auto;
  vertical-align: middle;

  @media (max-width: 640px) {
    min-height: 60px;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  margin: 8px;
  margin-bottom: 32px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const Hero = () => (
  <StyledHero>
    <HeroContent>
      <Navbar />
      <HeroHeader>Hypixel Stats Visualized</HeroHeader>
      <HeroDescription>
        <Typed
          strings={[
            "View all your Hypixel stats on Discord",
            "Check your stats in every game",
            "View your leaderboard positions",
            "See your improvements with daily stats",
            "See your improvements with weekly stats",
            "See your improvements with monthly stats",
          ]}
          typeSpeed={80}
          backSpeed={40}
          backDelay={500}
          loop
        />
      </HeroDescription>
      <Divider />
      <HeroButtons>
        <Button>Invite</Button>
        <Button>Discord</Button>
        <Button>Premium</Button>
      </HeroButtons>
    </HeroContent>
    <Image
      src={heroImage}
      alt="hero"
      layout="fill"
      objectFit="cover"
      placeholder="blur"
      priority
    />
  </StyledHero>
);
