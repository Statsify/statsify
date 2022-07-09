/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Link from "next/link";
import styles from "./button.module.scss";

export interface ButtonProps {
  children: React.ReactNode;
  link?: string;
}

export const Button = ({ link, children }: ButtonProps) => {
  if (link)
    return (
      <Link href={link}>
        <button className={styles.button}>{children}</button>
      </Link>
    );

  return <button className={styles.button}>{children}</button>;
};
