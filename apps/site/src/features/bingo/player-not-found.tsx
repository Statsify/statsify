/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { Link, useParams } from "@tanstack/react-router";
import { PlayerNotFoundView } from "~/features/player/player-not-found";
import { Search } from "~/components/search";
import { useTranslation } from "react-i18next";

/**
 * Bingo's player-not-found page, for the route's name unless one is given. Bingo reads stored players only, so an
 * unknown name is sent to its player page, which can look it up on Hypixel.
 */
export function BingoPlayerNotFound({ name: given }: { name?: string }) {
  const { t } = useTranslation();
  const { name: param = "" } = useParams({ strict: false });
  const name = given ?? param;

  return (
    <PlayerNotFoundView
      name={name}
      search={<Search key={name} className="w-full max-w-200 self-center" defaultValue={name} target="bingo" shortcut />}
    >
      <Button asChild variant="primary" className="w-full self-center sm:w-auto sm:min-w-64">
        <Link to="/{-$locale}/player/$name" params={{ name }} activeOptions={{ exact: true }}>
          {t("bingo.notFound.lookup", { name })}
        </Link>
      </Button>
    </PlayerNotFoundView>
  );
}
