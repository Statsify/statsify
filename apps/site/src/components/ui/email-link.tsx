/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Floating } from "./hint";
import { type MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/** How long "Copied!" shows. */
const COPIED_MS = 1500;

/**
 * An email address that a click copies, with "Copied!" over it for a moment: a mailto link does nothing for the many
 * visitors without a mail app set up. Without scripts it's a plain mailto link, and where copying fails the click opens
 * the mail app as the link would.
 */
export function EmailLink({ email, className }: { email: string; className?: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<DOMRect>();

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(undefined), COPIED_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = (event: MouseEvent<HTMLAnchorElement>) => {
    // Pages served over plain HTTP have no clipboard.
    if (!navigator.clipboard) return;
    event.preventDefault();
    const link = event.currentTarget;
    navigator.clipboard.writeText(email).then(
      () => setCopied(link.getBoundingClientRect()),
      () => location.assign(link.href)
    );
  };

  return (
    <>
      <a href={`mailto:${email}`} className={className} onClick={copy}>
        {email}
      </a>
      {copied && (
        <Floating anchor={copied} className="pointer-events-none px-2 py-1 text-mc-1 whitespace-nowrap text-mc-white">
          {t("footer.copied")}
        </Floating>
      )}
    </>
  );
}
