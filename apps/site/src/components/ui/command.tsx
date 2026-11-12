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
      {/* Solid shades of the blurple, so the text around it can be drawn crisp: the crisp filter makes see-through
          colors solid. They're what the half-transparent fill and outline showed over the dark sections. */}
      <button
        type="button"
        className="bg-[color-mix(in_srgb,var(--color-discord-500)_50%,#000)] hover:bg-[color-mix(in_srgb,var(--color-discord-500)_80%,#000)] transition-colors px-1.5 border-2 border-[color-mix(in_srgb,var(--color-discord-500)_75%,#000)] hover:border-[color-mix(in_srgb,var(--color-discord-500)_90%,#000)] text-[oklab(0.870541_0.00545415_-0.0617369)] cursor-pointer"
        onClick={(event) => void copy(command, event.currentTarget.getBoundingClientRect())}
      >
        {command}
      </button>
      {copied && <Copied anchor={copied}>{t("home.copied")}</Copied>}
    </>
  );
}
