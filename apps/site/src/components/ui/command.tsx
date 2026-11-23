/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Copied, useCopy } from "./copied";
import { useTranslation } from "react-i18next";

export function Command({ command }: { command: string }) {
  const { t } = useTranslation();
  const [copied, copy] = useCopy<DOMRect>();

  return (
    <>
      <button
        type="button"
        className="bg-discord-500/50 hover:bg-discord-500/80 transition-colors px-1.5 border-2 border-discord-500/50 text-[oklab(0.870541_0.00545415_-0.0617369)] cursor-pointer"
        onClick={(event) => void copy(command, event.currentTarget.getBoundingClientRect())}
      >
        {command}
      </button>
      {copied && <Copied anchor={copied}>{t("home.copied")}</Copied>}
    </>
  );
}
