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
    <div className="absolute w-screen h-[100dvh]">
      <Image src={BackgroundImage} alt="" fill={true} className="object-cover" />
      <div
        className=" absolute w-full h-full"
        style={{
          background: "linear-gradient(180deg, rgba(17, 17, 17, 0) 0%, rgba(17, 17, 17, 0) 20%, rgba(17, 17, 17, 1) 100%)",
        }}
      />
    </div>
  );
}
