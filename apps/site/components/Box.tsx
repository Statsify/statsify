/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import React, { type ReactNode } from "react";
import styled from "styled-components";

const background = `rgba(0, 0, 0, 0.5)`;

const border = {
  topLeft: "4px",
  topRight: "4px",
  bottomRight: "4px",
  bottomLeft: "4px",
};

const width = "100%";
const height = "100%";

const BaseBox = styled.div`
  background: ${background};
  width: ${width};
  height: ${height};
  padding-left: max(${border.topLeft}, ${border.bottomLeft});
  padding-right: max(${border.topRight}, ${border.bottomRight});
  clip-path: polygon(
    calc(0px + ${border.topLeft}) 0px,
    calc(0px + ${width} - ${border.topRight}) 0px,
    calc(0px + ${width} - ${border.topRight}) calc(0px + ${border.topRight}),
    calc(0px + ${width}) calc(0px + ${border.topRight}),
    calc(0px + ${width}) calc(0px + ${height} - ${border.bottomRight}),
    calc(0px + ${width} - ${border.bottomRight})
      calc(0px + ${height} - ${border.bottomRight}),
    calc(0px + ${width} - ${border.bottomRight}) calc(0px + ${height}),
    calc(0px + ${border.bottomLeft}) calc(0px + ${height}),
    calc(0px + ${border.bottomLeft}) calc(0px + ${height} - ${border.bottomLeft}),
    0px calc(0px + ${height} - ${border.bottomLeft}),
    0px calc(0px + ${border.topLeft}),
    calc(0px + ${border.topLeft}) calc(0px + ${border.topLeft})
  );
`;

const ShadowBox = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div className={className}>
    <BaseBox>{children}</BaseBox>
  </div>
);

export const Box = styled(ShadowBox)`
  filter: drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.42));
`;
