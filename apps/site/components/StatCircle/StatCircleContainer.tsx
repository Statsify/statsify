/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styles from "./stat-circle-container.module.scss";

export interface StatCircleContainerProps {
  children: React.ReactNode;
}

export const StatCircleContainer = ({ children }: StatCircleContainerProps) => (
  <div className={styles.container}>{children}</div>
);
