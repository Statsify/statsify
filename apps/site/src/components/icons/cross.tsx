/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function Cross({ className }: { className?: string }) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className={className}>
      <path
        d="M0 0h3v3H0zm21 0h3v3h-3zM0 3h6v3H0zm18 0h6v3h-6zM3 6h6v3H3zm12 0h6v3h-6zM6 9h12v6H6zm-3 6h6v3H3zm12 0h6v3h-6zM0 18h6v3H0zm18 0h6v3h-6zM0 21h3v3H0zm21 0h3v3h-3z"
        fill="currentColor"
      />
    </svg>
  );
}
