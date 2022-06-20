/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface ListProps {
  items: JSX.Element[];
  width?: JSX.Measurement;
}

export const List = ({ width = '100%', items }: ListProps) => {
  const columns: JSX.Element[][] = [];
  const remainingColumns: number[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    (item as unknown as JSX.Element[]).forEach((child, index) => {
      if (i === 0 && child.x.size === 'remaining') remainingColumns.push(index);

      child.x.size = '100%';

      if (columns[index]) columns[index].push(child);
      else columns[index] = [child];
    });
  }

  return (
    <div width={width}>
      {columns.map((c, index) => (
        <div direction="column" width={remainingColumns.includes(index) ? 'remaining' : undefined}>
          {c}
        </div>
      ))}
    </div>
  );
};
