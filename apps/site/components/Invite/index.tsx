/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styles from "./invite.module.scss";
import { Button } from "../Button";

export const Invite = () => (
  <div className={styles.invite}>
    <h1>What are you waiting for?</h1>
    <p>Invite Statsify today to enhance your Hypixel experience!</p>
    <Button>Invite Now</Button>
  </div>
);
