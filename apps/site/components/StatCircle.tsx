/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import CountUp from "react-countup";
import styled from "styled-components";

const StyledStatCircleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  color: #ffffff;
  font-size: 2rem;
  font-weight: 800;

  margin-left: 100px;
  margin-right: 100px;

  width: 150px;
`;

const StyledStatCircle = styled.div`
  background: linear-gradient(#2c7abf, #1668b1);
  border-radius: 35%;
  width: 125px;
  height: 125px;

  margin-top: 10px;
  margin-bottom: 10px;

  transition: 0.2s;

  &:hover {
    border-radius: 50%;

    animation: pulse;
    animation-duration: 1.05s;
  }
`;

const StyledStatCircleTitle = styled.p`
  color: #a2a2a2;
  font-size: 1rem;
  font-weight: normal;
`;

export interface StatCircleProps {
  value: number;
  title: string;
}

export const StatCircle = ({ title, value }: StatCircleProps) => (
  <StyledStatCircleContainer>
    <StyledStatCircle />
    <CountUp end={value} duration={2.75} separator="," />
    <StyledStatCircleTitle>{title}</StyledStatCircleTitle>
  </StyledStatCircleContainer>
);
