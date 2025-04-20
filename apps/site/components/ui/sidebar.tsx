/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";
import type { ReactNode } from "react";

export function Sidebar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Box className={`content:grid content:grid-cols-2 content:xl:flex content:xl:flex-col content:justify-center content:gap-2 content:text-start ${className}`}>
      {children}
    </Box>
  );
}

export function SidebarItem({ name, value, color }: { name: string; value: string; color: string }) {
  return (
    <p>
      <span className={color}>●</span> {name}: <span className={color}>{value}</span>
    </p>
  );
}
