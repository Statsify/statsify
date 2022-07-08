/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styled from "styled-components";

export const Button = styled.button`
  outline: none;
  border-style: none;
  border-radius: 25px;

  font-family: "Lexend Deca";
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  color: #fff;

  user-select: none;

  padding-left: 30px;
  padding-right: 30px;
  padding-top: 10px;
  padding-bottom: 10px;

  background: linear-gradient(#4c97d2, #2c7abf);
  box-shadow: inset 0px 4px 0px 0px #5db0e2, 0px 4px 0px 0px #115592;

  margin-left: 10px;
  margin-right: 10px;

  @media only screen and (max-device-width: 480px) {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  transition: 0.2s;

  &:hover {
    mix-blend-mode: lighten;

    padding-left: 40px;
    padding-right: 40px;

    animation: pulse;
    animation-duration: 1.05s;
  }
`;
