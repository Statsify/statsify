/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import CountUp from "react-countup";
import styles from "./stat-circle.module.scss";
import { ReactNode } from "react";

export interface StatCircleProps {
  value: number;
  title: string;
  image: ReactNode;
}

export const StatCircle = ({ title, value, image }: StatCircleProps) => (
  <div className={styles.container}>
    <div className={styles.circle}>{image}</div>
    <CountUp end={value} duration={3.75} separator="," />
    <p className={styles.title}>{title}</p>
  </div>
);

export * from "./StatCircleContainer";
