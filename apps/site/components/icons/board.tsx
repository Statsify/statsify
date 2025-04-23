/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function Board({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 6H26V26H6V6ZM8 8V12H12V16H8V20H12V24H16V20H20V24H24V20H20V16H24V12H20V8H16V12H12V8H8ZM16 16H12V20H16V16ZM16 12V16H20V12H16Z" fill="currentColor" />
    </svg>
  );
}
