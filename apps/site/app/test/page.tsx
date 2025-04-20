/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Link from "next/link";
import { Background } from "~/components/ui/background";
import { Button } from "~/components/ui/button";
import { LogoError } from "~/components/icons/logo-error";

export default function NotFound() {
  // TODO: take the wrong ign from the url here v
  // const misspelled_ign = "URL-WRONG-NAME";

  return (
    <div className="relative grow">
      <Background
        background="general"
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute w-full h-full bg-red-700 mix-blend-color  -z-10" />
      <div className="absolute w-full h-full bg-black/80 -z-10" />
      <div
        className="absolute w-full h-full -z-10"
        style={{ background: "linear-gradient(rgb(17 17 17 /0) 20%, rgb(17 17 17 /1) 95%)" }}
      />
      <div className="w-full h-full min-h-150 flex flex-col items-center justify-between z-10">
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
          <Button className="bg-blue-500">
            <p className="text-nowrap">Home Page</p>
          </Button>
        </Link>
      </div>
    </div>
  );
}
