/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlState<T extends string>(key: string, defaultValue: T) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get(key) ?? defaultValue;

  function setParams(newValue: T) {
    if (newValue === value) return;
    const newParams = new URLSearchParams(params.toString());
    newParams.set(key, newValue);
    router.push(`${pathname}?${newParams.toString()}`);
  }

  return [value, setParams] as const;
}
