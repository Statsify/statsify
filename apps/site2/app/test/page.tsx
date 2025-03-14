/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "~/components/ui/box";
import { CardStack } from "~/components/ui/card-stack";

export default function TestPage() {
  return (
    <CardStack>
      <div className="bg-red-300">
        <Box>Hello World 1</Box>
      </div>
      <div className="bg-yellow-300">Hello World 2</div>
      <div className="bg-blue-300">Hello World 3</div>
      <div className="bg-green-300">Hello World 4</div>
    </CardStack>
  );
}

