/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Multiline } from "../Multiline.js";

export interface HeaderBodyProps {
  description?: string;
  title: string;
}

export const HeaderBody = ({ description, title }: HeaderBodyProps) => {
  if (!description) {
    return (
      <box width="remaining" height="remaining">
        <text t:ignore>{title}</text>
      </box>
    );
  }

  return (
    <div direction="column" width="remaining" height="remaining">
      <box
        width="100%"
        direction="column"
        height="remaining"
        padding={{ bottom: 5, left: 10, right: 10, top: 5 }}
      >
        <Multiline t:ignore>{description}</Multiline>
      </box>
      <box width="100%">
        <text t:ignore>{title}</text>
      </box>
    </div>
  );
};
