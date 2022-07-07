/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styled from "styled-components";
import { Feature } from "../components/Feature";
import { StatCircle } from "../components/StatCircle";

const StatCircles = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  @media only screen and (max-device-width: 480px) {
    flex-direction: column;
  }
`;

const Index = () => (
  <>
    <StatCircles>
      <StatCircle title="Servers" value={80_000} />
      <StatCircle title="Commands Ran" value={45_000_000} />
    </StatCircles>
    <Feature
      title="TITLE"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis. "
      images={["/bedwars.png", "/skywars.png"]}
      align="left"
    />
    <Feature
      title="TITLE"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis. "
      images={["/skywars.png"]}
      align="right"
    />
    <Feature
      title="TITLE"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis. "
      images={["/bedwars.png"]}
      align="left"
    />
  </>
);

export default Index;
