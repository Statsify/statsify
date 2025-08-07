/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ZodSchema } from "zod";

export function useUrlState<T extends string>(key: string, schema: ZodSchema<T>, defaultValue: T) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const result = schema.safeParse(params.get(key));
  const value = result.data ?? defaultValue;

  function setParams(newValue: T) {
    if (newValue === value) return;
    const newParams = new URLSearchParams(params.toString());
    newParams.set(key, newValue);
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }

  return [value, setParams] as const;
}
