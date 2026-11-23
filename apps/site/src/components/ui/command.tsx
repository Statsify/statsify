/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PopoverTooltip } from "./tooltip";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function Command({ command }: { command: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <PopoverTooltip content={t("home.copied")} open={copied} onOpenChange={setCopied} asChild>
      <button
        type="button"
        className="bg-[oklab(0.57738_0.0140701_-0.208587)]/50 hover:bg-[oklab(0.57738_0.0140701_-0.208587)]/80 transition-colors px-1.5 border-2 border-[oklab(0.57738_0.0140701_-0.208587)]/50 text-[oklab(0.870541_0.00545415_-0.0617369)] cursor-pointer"
        onClick={() => navigator.clipboard.writeText(command)}
      >
        {command}
      </button>
    </PopoverTooltip>
  );
}
