/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styled from "styled-components";

export const Divider = styled.div`
  width: 60%;
  height: 1px;
  margin: 16px;
  background-color: rgba(255, 255, 255, 0.4);

  @media only screen and (max-device-width: 480px) {
    width: 90%;
  }
`;
