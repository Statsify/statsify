/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { Discord } from "~/components/icons/discord";

export default function TestPage() {
  return (
    <div className="p-4 w-full flex justify-center">
      <Button>
        <Discord className="drop-shadow-mc-1" />
        <p>Discord</p>
      </Button>
    </div>
  );
}

