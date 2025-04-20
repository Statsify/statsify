/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function Menu({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className={className}
    >
      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm16 5H4v2h16v-2z" fill="currentColor" />
    </svg>
  );
}
