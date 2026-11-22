/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Copied, useCopy } from "./copied";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

/** An email address a click copies, since a mailto link does nothing for visitors without a mail app set up. */
export function EmailLink({ email, className }: { email: string; className?: string }) {
  const { t } = useTranslation();
  const [copied, copy] = useCopy<DOMRect>();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!navigator.clipboard) return;
    event.preventDefault();
    const link = event.currentTarget;
    void copy(email, link.getBoundingClientRect()).then((done) => done || location.assign(link.href));
  };

  return (
    <>
      <a href={`mailto:${email}`} className={className} onClick={onClick}>
        {email}
      </a>
      {copied && <Copied anchor={copied}>{t("footer.copied")}</Copied>}
    </>
  );
}
