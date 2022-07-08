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
  h2,
  p {
    margin-bottom: 32px;
  }

  h1 {
    font-size: 3rem;
  }

  p {
    font-size: 1.2rem;
  }

  button {
    font-size: 1.5rem;
  }

  margin: 64px;
`;

export const Invite = () => (
  <StyledInvite>
    <h1>What are you waiting for?</h1>
    <p>Invite Statsify today to enhance your Hypixel experience!</p>
    <Button>Invite Now</Button>
  </StyledInvite>
);
