/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function Twitch({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M6 5H26V17H25V18H24V19H23V20H22V21H15V22H14V23H13V24H12V25H10V21H6V5ZM9 8V18H21V17H22V16H23V8H9ZM13 10H15V15H13V10ZM18 10H20V15H18V10Z" fill="currentColor" />
    </svg>
  );
}
