/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { PlayerProvider } from "./context";
import { ReactNode } from "react";

export default async function PlayerLayout({ params, children }: {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}) {
  const { slug } = await params;
  const response = await fetch(`https://api.statsify.net/player?key=${process.env.API_KEY}&player=${slug}`);
  const { player } = await response.json();

  return (
    <div>
      <PlayerProvider player={player}>
        <div className="flex justify-center text-[32px]">
          <Background />
          {children}
        </div>
      </PlayerProvider>
    </div>
  );
}
