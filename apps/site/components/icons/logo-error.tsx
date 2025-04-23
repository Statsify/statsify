/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function LogoError({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 5V3H5V4H6V5H7V6H8V7H9V8H10V9H11V10H12V11H13V12H14V13H15V14H16V15H17V14H18V13H19V12H20V11H23V12H24V13H25V14H26V15H27V16H28V15H29V19H25V18H26V17H25V16H24V15H23V14H22V13H21V14H20V15H19V16H18V17H15V16H14V15H13V14H12V13H11V12H10V11H9V10H8V9H7V8H6V7H5V6H4V5H3Z"
        className="fill-white drop-shadow-[0_1px_0_#404040]"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 13H3V28H4V29H7V28H8V13H7V12H4V13Z"
        className="fill-redify-100 logo-shadow-redify-100"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 20H10V28H11V29H14V28H15V20H14V19H11V20Z"
        className="fill-redify-200 logo-shadow-redify-200"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 21H17V28H18V29H21V28H22V21H21V20H18V21Z"
        className="fill-redify-300 logo-shadow-redify-300"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25 23H24V28H25V29H28V28H29V23H28V22H25V23Z"
        className="fill-redify-400 logo-shadow-redify-400"
      />
    </svg>
  );
}
