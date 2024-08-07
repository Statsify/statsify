/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Image from "next/image";
import discordImage from "../../public/discord.svg";
import heroImage from "../../public/hero.png";
import inviteImage from "../../public/invite.svg";
import premiumImage from "../../public/logo.svg";
import styles from "./hero.module.scss";
import { Button } from "../Button";
import { Divider } from "../Divider";
import { Navbar } from "./Navbar";
import { ReactTyped as Typed } from "react-typed";

export const Hero = () => (
  <div className={styles.hero}>
    <div className={styles.heroContainer}></div>
    <div className={styles.heroContent}>
      <Navbar />
      <div className={styles.heroHeader}>Hypixel Stats Visualized</div>
      <div className={styles.heroDescription}>
        <Typed
          strings={[
            "View all your Hypixel stats on Discord",
            "View your stats in every game",
            "View your leaderboard positions",
            "View your improvement with session stats",
          ]}
          typeSpeed={45}
          backSpeed={40}
          backDelay={500}
          loop
        />
      </div>
      <Divider />
      <div className={styles.heroButtons}>
        <Button link="/invite">
          <Image src={inviteImage} width={16} height={16} alt="Invite" />
          <p>Invite</p>
        </Button>
        <Button link="/discord">
          <Image src={discordImage} width={16} height={16} alt="Discord" />
          <p>Discord</p>
        </Button>
        <Button link="/premium">
          <Image src={premiumImage} width={16} height={16} alt="Premium" />
          <p>Premium</p>
        </Button>
      </div>
    </div>
    <Image
      src={heroImage}
      alt="hero"
      layout="fill"
      objectFit="cover"
      placeholder="blur"
      priority
    />
  </div>
);
