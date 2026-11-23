/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { Error, ErrorText } from "~/components/ui/error";
import { Link, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/** A player who never started a session: only the bot's `/session` starts one, so it says so, then links to their profile. */
export function SessionNotFound() {
  const { t } = useTranslation();
  const { name = "" } = useParams({ strict: false });

  return (
    <Error>
      <div className="flex w-full max-w-160 flex-col items-center gap-4 self-center">
        <ErrorText heading={<h1 className="text-mc-3 lg:text-mc-4 text-mc-red font-bold">{t("session.notFound.title")}</h1>}>
          <p className="text-mc-1.5 sm:text-mc-2 text-mc-gray text-center">{t("session.notFound.description", { name })}</p>
        </ErrorText>
        <Button asChild variant="primary" className="mt-2 min-w-48">
          <Link to="/{-$locale}/player/$name" params={{ name }}>{t("notFound.backProfile", { name })}</Link>
        </Button>
      </div>
    </Error>
  );
}
