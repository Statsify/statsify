/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styled from "styled-components";
import { Carousel } from "react-responsive-carousel";
import { ReactNode } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";

type Align = "left" | "right";

interface AlignProps {
  align: Align;
}

const StyledFeature = styled.div<AlignProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: ${(props) => (props.align === "left" ? "#1d1d1d" : "#111111")};
`;

const StyledFeatureContainer = styled.div<AlignProps>`
  display: flex;
  flex-direction: ${(props) => (props.align === "left" ? "row" : "row-reverse")};
  justify-content: center;
  align-items: center;

  color: #ffffff;
  width: 70%;

  margin-left: 32px;
  margin-right: 32px;
  margin-top: 48px;
  margin-bottom: 48px;

  @media (max-width: 1280px) {
    flex-direction: column-reverse;
    align-items: center;

    width: 90%;
  }
`;

const StyledFeatureCarouselContainer = styled.div`
  max-width: 600px;
`;

const StyledFeatureImageContainer = styled.div`
  margin: 1px;

  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100%;

  > span img {
    border-radius: 3%;

    @media (max-width: 1280px) {
      width: 90%;
      min-height: none;
      max-height: none;
    }

    @media (min-width: 1280px) {
      min-height: 300px;
      max-height: 450px;
    }
  }
`;

const StyledFeatureText = styled.div<AlignProps>`
  text-align: ${({ align }) => (align === "left" ? "right" : "left")};
  margin-left: 32px;
  margin-right: 32px;
  width: fit-content;

  > h1 {
    font-size: 3.3rem;
    font-weight: 800;
    margin-bottom: 8px;
  }

  > p {
    font-size: 1.2rem;
    font-weight: normal;
    line-height: 160%;
  }

  @media (max-width: 1280px) {
    margin-top: 20px;
    text-align: center;
    margin-left: 0px;
    margin-right: 0px;

    > h1 {
      font-size: 2.5rem;
    }

    > p {
      font-size: 1rem;
    }
  }
`;

export interface FeatureProps extends AlignProps {
  title: string;
  images: ReactNode[];
  children?: ReactNode;
}

export const Feature = ({ align, title, children, images }: FeatureProps) => (
  <StyledFeature align={align}>
    <StyledFeatureContainer align={align}>
      <StyledFeatureText align={align}>
        <h1>{title}</h1>
        <p>{children}</p>
      </StyledFeatureText>
      {images.length > 1 ? (
        <StyledFeatureCarouselContainer>
          <Carousel
            showThumbs={false}
            showStatus={false}
            showArrows={false}
            showIndicators={false}
            autoFocus
            infiniteLoop
            swipeable
            emulateTouch
            autoPlay
          >
            {images.map((image, index) => (
              <StyledFeatureImageContainer key={index}>
                {image}
              </StyledFeatureImageContainer>
            ))}
          </Carousel>
        </StyledFeatureCarouselContainer>
      ) : (
        <StyledFeatureImageContainer>{images[0]}</StyledFeatureImageContainer>
      )}
    </StyledFeatureContainer>
  </StyledFeature>
);
