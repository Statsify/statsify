/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { EXPERIMENTS, type ExperimentsSection } from "#types";
import type { RawMember } from "#raw";

const TIERS = 6;

/** null before the member's first experiment. A tier shows once it was tried or claimed. */
export function getExperiments(member: RawMember): ExperimentsSection | null {
  const raw = member.experimentation;
  if (!raw) return null;

  const games = EXPERIMENTS.map((game) => {
    const data = raw[game] ?? {};
    const tiers = Array.from({ length: TIERS }, (_, tier) => ({
      tier,
      attempts: data[`attempts_${tier}`],
      claims: data[`claims_${tier}`] ?? 0,
      bestScore: data[`best_score_${tier}`],
    })).filter(({ attempts, claims, bestScore }) => attempts !== undefined || claims > 0 || bestScore !== undefined);

    return { game, bonusClicks: data.bonus_clicks ?? 0, tiers };
  });

  return { games, serums: raw.serums_drank ?? 0 };
}
