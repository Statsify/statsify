/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import Link from "next/link";
import discord from "../../public/socials/discord.svg";
import github from "../../public/socials/github.svg";
import logo from "../../public/banner.svg";
import patreon from "../../public/socials/patreon.svg";
import styles from "./footer.module.scss";
import twitter from "../../public/socials/twitter.svg";

export const Footer = () => (
  <footer className={styles.footer}>
    <Image src={logo} alt="logo" width="200vw" height="75vh" />
    <div className={styles.socials}>
      <Link href="/">
        <div className={styles.link}>
          <Image src={discord} alt="Discord" width={32} height={32} />
        </div>
      </Link>
      <Link href="/">
        <div className={styles.link}>
          <Image src={github} alt="GitHub" width={32} height={32} />
        </div>
      </Link>
      <Link href="/">
        <div className={styles.link}>
          <Image src={patreon} alt="Patreon" width={32} height={32} />
        </div>
      </Link>
      <Link href="/">
        <div className={styles.link}>
          <Image src={twitter} alt="Twitter" width={32} height={32} />
        </div>
      </Link>
    </div>
    <div className={styles.links}>
      <Link href="/">
        <div className={styles.link}>Premium</div>
      </Link>
      <Link href="/">
        <div className={styles.link}>Support</div>
      </Link>
      <Link href="/">
        <div className={styles.link}>Terms of Service</div>
      </Link>
      <Link href="/">
        <div className={styles.link}>Privacy Policy</div>
      </Link>
    </div>
  </footer>
);
