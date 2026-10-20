/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

export function AnimatedNumber({ value }: { value: number }) {
  const fractionDigits = Number.isInteger(value) ? 0 : 2;
  const numberFormat = Intl.NumberFormat("en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });

  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const displayText = useTransform(spring, numberFormat.format.bind(numberFormat));
  const reduceMotion = useReducedMotion();

  // With reduced motion the number jumps straight to its value.
  useEffect(() => {
    if (reduceMotion) spring.jump(value);
    else spring.set(value);
  }, [spring, value, reduceMotion]);

  return <motion.span>{displayText}</motion.span>;
}
