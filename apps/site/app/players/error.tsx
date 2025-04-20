/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Error } from "~/components/ui/error";
import { LogoError } from "~/components/icons/logo-error";

export default function UnknownErrorPage() {
  return (
    <Error>
      <div className="flex grow flex-col items-center justify-center gap-4">
        <LogoError className="size-64 lg:size-80" />
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-mc-4 lg:text-mc-8 text-mc-red font-bold">Unkown Error</h1>
          <p className="max-w-64 lg:max-w-none text-mc-1.5 lg:text-mc-2 text-mc-gray text-center">
            Something went wrong!
          </p>
        </div>
      </div>
      <Link href="/" className="mb-4">
        <Button className="content:bg-blueify-400">
          <p className="text-nowrap">Home Page</p>
        </Button>
      </Link>
    </Error>
  );
}
