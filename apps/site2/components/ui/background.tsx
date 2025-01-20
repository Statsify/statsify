/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import BackgroundImage from "~/public/background.png";
import Image from "next/image";

export function Background() {
  return (
    <div className="absolute w-screen h-[80dvh]">
      <Image
        src={BackgroundImage}
        alt=""
        fill={true}
        className="object-cover object-top blur-xs"
        style={{
          mask: "linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
        }}
      />
    </div>
  );
}

