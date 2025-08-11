/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { PopoverTooltip } from "./tooltip";
import { useEffect, useState } from "react";

export function Command({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <PopoverTooltip content="Copied to Clipboard!" open={copied} onOpenChange={setCopied} asChild>
      <span
        className="bg-[oklab(0.57738_0.0140701_-0.208587)]/50 hover:bg-[oklab(0.57738_0.0140701_-0.208587)]/80 transition-colors
         py-1 px-1.5 border-2 border-[oklab(0.57738_0.0140701_-0.208587)]/50 text-[oklab(0.870541_0.00545415_-0.0617369)] text-mc-2 cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(command);
        }}
      >
        {command}
      </span>
    </PopoverTooltip>
  );
}
