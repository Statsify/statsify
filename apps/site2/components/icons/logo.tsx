/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function Logo({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25 3H28H29V4V7H28V6H27V7H26V8H25V9H24V10H23V11H22V12H21V13H20H19H18V12H17V11H16V10H15V9H14V8H13V7H12V8H11V9H10V10H9V11H8V12H7V13H6V14H5V15H3V13H4V12H5V11H6V10H7V9H8V8H9V7H10V6H11V5H12H13H14V6H15V7H16V8H17V9H18V10H19V11H20V10H21V9H22V8H23V7H24V6H25V5H26V4H25V3Z"
        className="fill-white drop-shadow-[0_1px_0_#404040]"
      />
      <path fillRule="evenodd" clipRule="evenodd" d="M4 19H7V20H8V27H7V28H4V27H3V20H4V19Z" className="fill-[#D0EFFF] logo-shadow-[#D0EFFF]" />
      <path fillRule="evenodd" clipRule="evenodd" d="M11 15H14V16H15V27H14V28H11V27H10V16H11V15Z" className="fill-[#2A9DF4] logo-shadow-[#2A9DF4]" />
      <path fillRule="evenodd" clipRule="evenodd" d="M18 16H21V17H22V27H21V28H18V27H17V17H18V16Z" className="fill-[#187BCD] logo-shadow-[#187BCD]" />
      <path fillRule="evenodd" clipRule="evenodd" d="M25 12H28V13H29V27H28V28H25V27H24V13H25V12Z" className="fill-[#1167B1] logo-shadow-[#1167B1]" />
    </svg>
  );
}
