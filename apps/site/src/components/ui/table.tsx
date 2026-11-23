/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box } from "./box";

export function TableData({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <Box
      className={`content:p-4 content:flex content:flex-col content:justify-center content:items-center content:gap-2 ${color}`}
    >
      <p className="text-mc-1.25 lg:text-mc-2 mx-3">{title}</p>
      <p className="text-mc-2.5 lg:text-mc-4 mx-5">{value}</p>
    </Box>
  );
}
