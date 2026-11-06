/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function Instagram({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M9 5H23V6H25V7H26V9H27V23H26V25H25V26H23V27H9V26H7V25H6V23H5V9H6V7H7V6H9V5ZM10 8V9H9V10H8V22H9V23H10V24H22V23H23V22H24V10H23V9H22V8H10ZM14 11H18V12H20V14H21V18H20V20H18V21H14V20H12V18H11V14H12V12H14V11ZM14 13V14H13V18H14V19H18V18H19V14H18V13H14ZM21 9H23V11H21V9Z" fill="currentColor" />
    </svg>
  );
}
