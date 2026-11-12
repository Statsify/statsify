/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";
import { glossaryWordsResponse } from "~/server/glossary-words.server";

/** Every stat's glossary words, for the leaderboards and the "?" boxes, which fetch them rather than carry them. */
export const Route = createFileRoute("/glossary-{$hash}.json")({
  server: {
    handlers: {
      GET: ({ params }) => glossaryWordsResponse(params.hash),
    },
  },
});
