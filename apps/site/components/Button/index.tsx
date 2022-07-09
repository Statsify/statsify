/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styles from "./button.module.scss";

export interface ButtonProps {
  children: React.ReactNode;
}

export const Button = ({ children }: ButtonProps) => (
  <button className={styles.button}>{children}</button>
);
