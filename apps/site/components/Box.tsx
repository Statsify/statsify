/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import React, { type ReactNode } from "react";
import styled from "styled-components";

const BaseBox = styled.div<Required<Omit<BoxProps, "className" | "children" | "shadow">>>`
  background-color: ${(props) => props.color};
  width: ${(props) => props.width};
  height: ${(props) => props.width};
  padding-left: calc(
    max(${(props) => props.border.topLeft}, ${(props) => props.border.bottomLeft}) + 5px
  );
  padding-right: calc(
    max(${(props) => props.border.topRight}, ${(props) => props.border.bottomRight}) + 5px
  );
  padding-top: calc(
    max(${(props) => props.border.topRight}, ${(props) => props.border.topLeft})
  );
  padding-bottom: calc(
    max(${(props) => props.border.bottomRight}, ${(props) => props.border.bottomLeft})
  );
  clip-path: polygon(
    ${(props) => props.border.topLeft} 0px,
    calc(${(props) => props.width} - ${(props) => props.border.topRight}) 0px,
    calc(${(props) => props.width} - ${(props) => props.border.topRight})
      ${(props) => props.border.topRight},
    ${(props) => props.width} ${(props) => props.border.topRight},
    ${(props) => props.width}
      calc(${(props) => props.height} - ${(props) => props.border.bottomRight}),
    calc(${(props) => props.width} - ${(props) => props.border.bottomRight})
      calc(${(props) => props.height} - ${(props) => props.border.bottomRight}),
    calc(${(props) => props.width} - ${(props) => props.border.bottomRight})
      ${(props) => props.height},
    ${(props) => props.border.bottomLeft} ${(props) => props.height},
    ${(props) => props.border.bottomLeft}
      calc(${(props) => props.height} - ${(props) => props.border.bottomLeft}),
    0px calc(${(props) => props.height} - ${(props) => props.border.bottomLeft}),
    0px ${(props) => props.border.topLeft},
    ${(props) => props.border.topLeft} ${(props) => props.border.topLeft}
  );

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

interface BoxBorder {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
}

interface BoxProps {
  children: ReactNode;
  className?: string;
  width?: string;
  height?: string;
  border?: BoxBorder;
  color?: string;
  shadow?: string;
}

const ShadowBox = ({
  children,
  className,
  color = "rgba(0, 0, 0, 0.5)",
  border = {
    bottomLeft: "8px",
    bottomRight: "8px",
    topLeft: "8px",
    topRight: "8px",
  },
}: BoxProps) => (
  <div className={className}>
    <BaseBox width="100%" height="100%" color={color} border={border}>
      {children}
    </BaseBox>
  </div>
);

//TODO: Figure out how to add shadow to the boxes
export const Box = styled(ShadowBox)`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  /* filter: drop-shadow(
    ${(props) => props.shadow} ${(props) => props.shadow} 0px rgba(0, 0, 0, 0.42)
  ); */
`;

Box.defaultProps = {
  shadow: "8px",
  width: "fit-content",
  height: "fit-content",
};
