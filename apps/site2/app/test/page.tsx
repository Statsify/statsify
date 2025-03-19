/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Carousel } from "~/components/ui/card-stack";

export default function TestPage() {
  return (
    <Carousel>
      <div className="bg-red-400 p-10">1</div>
      <div className="bg-green-400 p-10">2</div>
      <div className="bg-blue-400 p-10">3</div>
      <div className="bg-yellow-400 p-10">4</div>
    </Carousel>
  );
}

