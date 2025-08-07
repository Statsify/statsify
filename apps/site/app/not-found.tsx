/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Error } from "~/components/ui/error";
import { LogoError } from "~/components/icons/logo-error";

export default function NotFound() {
  return (
    <Error>
      <LogoError className="size-64 lg:size-80" />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-mc-6 lg:text-mc-8 font-bold">
          <span className="text-redify-100">O</span>
          <span className="text-redify-200">O</span>
          <span className="text-redify-300">P</span>
          <span className="text-redify-400">S</span>
          <span className="text-redify-500">!</span>
        </h1>
        <p className="text-mc-1.5 lg:text-mc-2 text-mc-gray text-center">
          Looks like the page you&apos;re trying to reach does not exist
        </p>
      </div>
    </Error>
  );
}
