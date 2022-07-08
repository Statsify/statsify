/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Typed from "react-typed";
import styled from "styled-components";
import { Button } from "../Button";
import { Divider } from "../Divider";
import { Navbar } from "./Navbar";

const StyledHero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    url("/hero.png");

  width: 100%;

  color: #ffffff;
  text-align: center;
  text-shadow: 2px 2px rgba(0, 0, 0, 0.4);
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
  margin: 8px;
`;

const HeroButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  margin: 8px;
  margin-bottom: 32px;

  @media only screen and (max-device-width: 480px) {
    flex-direction: column;
  }
`;

export const Hero = () => (
  <StyledHero>
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
  </StyledHero>
);
