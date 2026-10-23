/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { useNumberFormat } from "~/i18n/use-number-format";

/** `trim` drops a shortened count's zero decimals: "70M", not "70.00M". */
export function AnimatedNumber({ value, trim = false }: { value: number; trim?: boolean }) {
  const n = useNumberFormat(trim);
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  // The bot's format; on its way to a whole number the spring passes through fractions, which would show decimals.
  const displayText = useTransform(spring, (current) => n(Number.isInteger(value) ? Math.round(current) : current));
  const reduceMotion = useReducedMotion();

  // With reduced motion the number jumps straight to its value.
  useEffect(() => {
    if (reduceMotion) spring.jump(value);
    else spring.set(value);
  }, [spring, value, reduceMotion]);

  return <motion.span>{displayText}</motion.span>;
}
