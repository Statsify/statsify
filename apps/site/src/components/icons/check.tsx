/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function Check({ className }: { className?: string }) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className={className}>
      <path d="M21 3h3v3h-3zM18 6h6v3h-6zM0 9h3v3H0zm15 0h6v3h-6zM0 12h6v3H0zm12 0h6v3h-6zM3 15h12v3H3zm3 3h6v3H6z" fill="currentColor" />
    </svg>
  );
}
