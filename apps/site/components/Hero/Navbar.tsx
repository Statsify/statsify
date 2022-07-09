/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import Logo from "../../public/banner.svg";
import styles from "./navbar.module.scss";

export const Navbar = () => (
  <nav className={styles.nav}>
    <div className={styles.branding}>
      <Image src={Logo} alt="logo" priority layout="fill" objectFit="fill" />
    </div>
  </nav>
);
