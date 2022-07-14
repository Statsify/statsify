/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styles from "./about.module.scss";

export const About = () => (
  <div className={styles.container}>
    <h1>About Us</h1>
    <p>
      Statsify is an easy to use multipurpose Discord bot for viewing your Hypixel stats.
      Statsify can track statistics in several game modes on the Hypixel Network, such as
      Bed Wars, Sky Wars, Duels, and many other minigames. It is the #1 stat bot for
      tracking your progress and improvements while Minecraft.
    </p>
  </div>
);
