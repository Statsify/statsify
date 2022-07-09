/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styles from "./code.module.scss";
import { ReactNode } from "react";

export interface CodeProps {
  children: ReactNode;
}

export const Code = ({ children }: CodeProps) => (
  <code className={styles.code}>{children}</code>
);
