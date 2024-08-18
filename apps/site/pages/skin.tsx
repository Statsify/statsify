/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Skin, SkinProvider } from "../components/skin";

export default function SkinPage() {
  return (
    <SkinProvider>
    	<Skin url="http://textures.minecraft.net/texture/4decf7b406a5127159dc9d83b79270b577b3b64b67bcfcc2e171d13a3bd2887d" slim={true} extruded={false} />
  	</SkinProvider>
  );
}