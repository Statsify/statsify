/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/future/image";
import styled from "styled-components";
import { Carousel } from "react-responsive-carousel";
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

  color: #ffffff;
  width: 70%;

  margin-left: 32px;
  margin-right: 32px;
  margin-top: 48px;
  margin-bottom: 48px;

  @media only screen and (max-device-width: 480px) {
    flex-direction: column-reverse;
    width: 90%;
  }
`;

const StyledFeatureImageContainer = styled.div`
  margin: 1px;

  display: flex;
  justify-content: center;

  > img {
    border-radius: 3%;
    width: 100%;
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
  }

  > p {
    font-size: 1.2rem;
    font-weight: normal;
  }

  @media only screen and (max-device-width: 480px) {
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
  description: string;
  images: string[];
}

export const Feature = ({ align, title, description, images }: FeatureProps) => (
  <StyledFeature align={align}>
    <StyledFeatureContainer align={align}>
      <StyledFeatureText align={align}>
        <h1>{title}</h1>
        <p>{description}</p>
      </StyledFeatureText>
      {images.length > 1 ? (
        <Carousel
          showThumbs={false}
          showStatus={false}
          showArrows={false}
          autoFocus
          infiniteLoop
          swipeable
          emulateTouch
          autoPlay
        >
          {images.map((image, index) => (
            <StyledFeatureImageContainer key={index}>
              <Image src={image} />
            </StyledFeatureImageContainer>
          ))}
        </Carousel>
      ) : (
        <StyledFeatureImageContainer>
          <Image src={images[0]} />
        </StyledFeatureImageContainer>
      )}
    </StyledFeatureContainer>
  </StyledFeature>
);
