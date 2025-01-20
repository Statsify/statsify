/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";

export function TableData({ title, value, color }: { title: string; value: string;color: string }) {
  return (
    <Box contentClass={`p-4 flex flex-col items-center gap-2 ${color}`}>
      <p className="text-mc-2 mx-3">{title}</p>
      <p className="text-mc-4 mx-5">{value}</p>
    </Box>
  );
}
