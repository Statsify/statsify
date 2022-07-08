/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styled from "styled-components";
import { Button } from "./Button";

const StyledInvite = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  color: #ffffff;
  text-align: center;

  h1,
  p {
    margin-bottom: 16px;
  }

  margin-bottom: 32px;
`;

export const Invite = () => (
  <StyledInvite>
    <h1>What are you waiting for?</h1>
    <p>Invite Statsify today to enhance your Hypixel experience!</p>
    <Button>Invite Now</Button>
  </StyledInvite>
);
