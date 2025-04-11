/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BingoPage } from "./bingo";

async function getPlayer(slug: string) {
  const response = await fetch(`http://localhost:3000/player?key=${process.env.API_KEY}&player=${slug}`);
  const { player } = await response.json();
  return player;
}

export default async function TestPage() {
  const player = await getPlayer("Amony");

  return <BingoPage player={player} />;
}
