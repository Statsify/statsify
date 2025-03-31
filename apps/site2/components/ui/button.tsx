/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import styles from "./button.module.css";
import { ComponentProps } from "react";
import { cn } from "~/lib/util";

export function Button({
  children,
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <div
      className="text-mc-white"
      style={{
        filter: `drop-shadow(8px 8px rgb(0 0 0 / 0.5))`,
      }}
    >
      <button
        {...props}
        className={cn("w-full relative flex justify-center items-center gap-1 text-mc-2", styles.button, className)}
      >
        <div className={`absolute top-0 left-0 w-full ${styles.topShadow}`} />
        {children}
        <div className={`absolute bottom-0 left-0 w-full  ${styles.bottomShadow}`} />
      </button>
    </div>
  );
}
