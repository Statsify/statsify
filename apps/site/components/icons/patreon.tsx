/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function Patreon({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M28 14V8H27V7H26V6H24V5H21V4H14V5H11V6H9V7H8V8H7V10H6V11H5V14H4V20H5V23H6V25H7V26H8V27H9V28H12V27H13V26H14V24H15V22H16V21H17V20H18V19H20V18H23V17H25V16H27V14H28Z"
        fill="currentColor"
      />
    </svg>
  );
}
