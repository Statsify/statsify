/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import React, { type ReactNode } from "react";
import styled from "styled-components";

const shadowColor = "rgba(0, 0, 0, 0.42)";

type BaseBoxProps = Required<Omit<BoxProps, "className" | "children" | "shadow">>;

const BaseBox = styled.div<BaseBoxProps>`
  background-color: ${(props) => props.color};
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  padding-left: max(
    ${(props) => props.border.topLeft},
    ${(props) => props.border.bottomLeft}
  );
  padding-right: max(
    ${(props) => props.border.topRight},
    ${(props) => props.border.bottomRight}
  );
  padding-top: calc(
    max(${(props) => props.border.topRight}, ${(props) => props.border.topLeft})
  );
  padding-bottom: calc(
    max(${(props) => props.border.bottomRight}, ${(props) => props.border.bottomLeft})
  );
  clip-path: polygon(
    ${(props) => props.border.topLeft} 0,
    calc(${(props) => props.width} - ${(props) => props.border.topRight}) 0,
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
    0 calc(${(props) => props.height} - ${(props) => props.border.bottomLeft}),
    0 ${(props) => props.border.topLeft},
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

type ShadowRightBoxProps = Required<Omit<BoxProps, "className" | "children" | "width">>;

// prettier-ignore

const ShadowRightBox = styled.div<ShadowRightBoxProps>`
  min-width: ${(props) => props.shadow};
  background-color: ${(props) => props.color};
  margin: 0;
  padding: 0;
  clip-path: polygon(
    0 calc(${(props) => props.shadow} + ${(props) => props.border.topRight}),
    ${(props) => props.shadow} calc(${(props) => props.shadow} + ${(props) => props.border.topRight}),
    ${(props) => props.shadow} ${(props) => props.height},
    0 ${(props) => props.height}
  );
`;

type CornerShadowBoxProps = Required<
  Omit<BoxProps, "className" | "children" | "width" | "height">
>;

const CornerShadow = styled.div<CornerShadowBoxProps>`
  min-width: ${(props) => props.shadow};
  min-height: ${(props) => props.shadow};

  background-color: ${(props) => props.color};

  position: absolute;
  right: ${(props) => props.shadow};
  bottom: 0;
`;

const ChildrenContainer = styled.div`
  margin-left: 5px;
  margin-right: 5px;
`;

const BoxWithRightShadow = ({
  children,
  className,
  border,
  shadow,
  color,
}: Required<Omit<BoxProps, "width" | "height" | "className">> & {
  className?: string;
}) => (
  <div className={className}>
    <BaseBox width="100%" height="100%" color={color} border={border}>
      <ChildrenContainer>{children}</ChildrenContainer>
    </BaseBox>
    <CornerShadow color={shadowColor} shadow={shadow} border={border} />
    <ShadowRightBox height="100%" color={shadowColor} shadow={shadow} border={border} />
  </div>
);

export const StyledBoxWithRightShadow = styled(BoxWithRightShadow)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  position: relative;
`;

type ShadowBottomBoxProps = Required<Omit<BoxProps, "className" | "children" | "height">>;

const ShadowBottomBox = styled.div<ShadowBottomBoxProps>`
  width: ${(props) => props.width};
  height: ${(props) => props.shadow};
  background-color: ${(props) => props.color};
  margin: 0;
  padding: 0;

  clip-path: polygon(
    calc(${(props) => props.border.bottomLeft} + ${(props) => props.shadow}) 0,
    calc(${(props) => props.border.bottomLeft} + ${(props) => props.shadow})
      ${(props) => props.shadow},
    calc(${(props) => props.width} - ${(props) => props.shadow})
      ${(props) => props.shadow},
    calc(${(props) => props.width} - ${(props) => props.shadow}) 0
  );
`;

const BoxWithRightShadowAndBottomShadow = ({
  children,
  className,
  color = "rgba(0, 0, 0, 0.5)",
  border = {
    bottomLeft: "8px",
    bottomRight: "8px",
    topLeft: "8px",
    topRight: "8px",
  },
  shadow = "8px",
}: BoxProps) => (
  <div className={className}>
    <StyledBoxWithRightShadow
      border={border}
      children={children}
      color={color}
      shadow={shadow}
    />
    <ShadowBottomBox width="100%" border={border} color={shadowColor} shadow={shadow} />
  </div>
);

export const Box = styled(BoxWithRightShadowAndBottomShadow)`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

Box.defaultProps = {
  width: "fit-content",
  height: "fit-content",
};
