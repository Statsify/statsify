/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styles from "./feature.module.scss";
import { Carousel } from "react-responsive-carousel";
import { ReactNode } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";

type Align = "left" | "right";

export interface FeatureProps {
  title: string;
  images: ReactNode[];
  children?: ReactNode;
  align: Align;
}

export const Feature = ({ align, title, children, images }: FeatureProps) => (
  <div
    className={styles.feature}
    style={{ backgroundColor: align === "left" ? "#1d1d1d" : "#111111" }}
  >
    <div
      className={styles.container}
      style={{ flexDirection: align === "left" ? "row" : "row-reverse" }}
    >
      <div
        className={styles.text}
        style={{ textAlign: align === "left" ? "right" : "left" }}
      >
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
      {images.length > 1 ? (
        <div className={styles.carousel}>
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
              <div key={index} className={styles.image}>
                {image}
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        <div className={styles.image}>{images[0]}</div>
      )}
    </div>
  </div>
);
