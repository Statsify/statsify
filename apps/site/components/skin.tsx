/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import init, { SkinMessenger,SkinRenderer } from "@statsify/skin-renderer/wasm";
import { ReactNode, createContext, useContext, useEffect, useId, useState } from "react";

const SkinContext = createContext<{ renderer?: SkinRenderer }>({});

export function Skin({ url, slim, extruded }: { url: string; slim: boolean; extruded: boolean }) {
  const id = useId();
  const { renderer } = useContext(SkinContext);
  const [bytes, setBytes] = useState<Uint8Array>();

  useEffect(() => {
    if (!renderer) return;
    SkinMessenger.createCanvas(id);
    return () => SkinMessenger.deleteCanvas(id);
  }, [renderer, id]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchSkin() {
      const response = await fetch(url, { signal });
      const buffer = await response.arrayBuffer();
      setBytes(new Uint8Array(buffer));
    }

    fetchSkin();

    return () => controller.abort("reloading");
  }, [url]);

  useEffect(() => {
    if (!bytes || !renderer) return;
    SkinMessenger.renderSkin(id, bytes, slim, false);
  }, [renderer, id, bytes, slim, extruded]);

  return (
    <canvas
      id={id}
      style={{ position: "absolute" }}
      width={600}
      height={800}
    />
  );
}

export interface SkinProviderProps {
	children: ReactNode;
}

export function SkinProvider({ children }: SkinProviderProps) {
  const [renderer, setRenderer] = useState<SkinRenderer | undefined>();

  useEffect(() => {
    if (renderer) return;

    init().then(() => {
      const skinRenderer = new SkinRenderer();
      skinRenderer.run();
      setRenderer(skinRenderer);
    });
  }, [renderer]);

  return <SkinContext.Provider value={{ renderer }}>{children}</SkinContext.Provider>;
}