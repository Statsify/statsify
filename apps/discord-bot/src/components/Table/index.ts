/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table as TableComponent } from "./Table";
import { TableData } from "./TableData";
import { TableRow } from "./TableRow";
import { TableSeparator } from "./TableSeparator";

export const Table = {
  table: TableComponent,
  td: TableData,
  tr: TableRow,
  ts: TableSeparator,
};
