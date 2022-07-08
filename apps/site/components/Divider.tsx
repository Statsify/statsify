/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styled from "styled-components";

export const Divider = styled.div`
  width: 40%;
  margin: 24px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.4);

  @media (max-width: 640px) {
    width: 90%;
  }
`;
