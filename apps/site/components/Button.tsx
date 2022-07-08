/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styled, { keyframes } from "styled-components";

const ripple = keyframes`
   from {
      opacity: 1;
      transform: scale(0);
    }
    to {
      opacity: 0;
      transform: scale(10);
    }
`;

export const Button = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;

  > p {
    margin-left: 7px;
  }

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

  @media (max-width: 640px) {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  position: relative;
  overflow: hidden;

  transition: all 0.2s;

  &:hover {
    filter: brightness(110%);
    cursor: pointer;
  }

  &:active {
    transform: scale(0.92);
  }

  &::after {
    display: none;
    content: "";
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);

    width: 100px;
    height: 100px;
    margin-top: -50px;
    margin-left: -50px;

    top: 50%;
    left: 50%;

    animation: ${ripple};
    animation-duration: 0.6s;
    opacity: 0;
  }

  &:focus:not(:active)::after {
    display: block;
  }
`;
