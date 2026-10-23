/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/* eslint-disable jsx-a11y/prefer-tag-over-role -- the turn is a slider on the model itself, which is what's dragged,
   and it wraps round past 359; a range input can be neither. */

import { Box } from "~/components/ui/box";
import { Button } from "~/components/ui/button";
import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";
import { useRevealOnOpen } from "./share-panel";
import { useTranslation } from "react-i18next";

/** Screen pixels per skin pixel. */
const SCALE = 8;
/** How far an arrow key turns the model, and how far a dragged pixel does. */
const STEP = 15;
const DRAG = 0.6;
const MAX_PITCH = 60;

interface Texture {
  src: string;
  /** Alex's 3-pixel arms. */
  slim: boolean;
  /** A 64×32 skin from before 1.8: no outer layer but the hat, and the left limbs mirror the right ones. */
  legacy: boolean;
}

/** A cuboid on the skin: where its faces start on the texture and its size, in skin pixels. */
type Cuboid = [u: number, v: number, w: number, h: number, d: number];

/**
 * One part of the model: a cuboid's six faces, each a window onto the texture, placed at `at` (skin pixels from the
 * model's centre). `inflate` grows an outer layer past the part under it, as the game does; `mirror` draws a legacy
 * skin's left limb from the right one.
 */
function Part({ cuboid, at, texture, inflate = 0, mirror = false }: { cuboid: Cuboid; at: [number, number, number]; texture: Texture; inflate?: number; mirror?: boolean }) {
  const [u, v, w, h, d] = cuboid;
  const [width, height, depth] = [w, h, d].map((size) => (size + 2 * inflate) * SCALE);
  const rows = texture.legacy ? 32 : 64;
  // Each face: where it starts on the texture, its size there and on screen, and how it's turned into place.
  const faces: [x: number, y: number, tw: number, th: number, sw: number, sh: number, transform: string][] = [
    [u + d, v + d, w, h, width, height, `translateZ(${depth / 2}px)`],
    [u + 2 * d + w, v + d, w, h, width, height, `rotateY(180deg) translateZ(${depth / 2}px)`],
    [u, v + d, d, h, depth, height, `rotateY(-90deg) translateZ(${width / 2}px)`],
    [u + d + w, v + d, d, h, depth, height, `rotateY(90deg) translateZ(${width / 2}px)`],
    [u + d, v, w, d, width, depth, `rotateX(90deg) translateZ(${height / 2}px)`],
    [u + d + w, v, w, d, width, depth, `rotateX(-90deg) translateZ(${height / 2}px)`],
  ];

  return (
    <div
      className="absolute transform-3d"
      style={{ transform: `translate3d(${at[0] * SCALE}px, ${at[1] * SCALE}px, ${at[2] * SCALE}px)${mirror ? " scaleX(-1)" : ""}` }}
    >
      {faces.map(([x, y, tw, th, sw, sh, transform]) => {
        const [sx, sy] = [sw / tw, sh / th];

        return (
          <div
            key={transform}
            className="absolute"
            style={{
              left: -sw / 2,
              top: -sh / 2,
              width: sw,
              height: sh,
              transform,
              backgroundImage: `url(${texture.src})`,
              backgroundSize: `${64 * sx}px ${rows * sy}px`,
              backgroundPosition: `${-x * sx}px ${-y * sy}px`,
              imageRendering: "pixelated",
            }}
          />
        );
      })}
    </div>
  );
}

/** The player's skin in 3D: the inner layer, then the outer one (a legacy skin has only the hat). */
function Model({ texture }: { texture: Texture }) {
  const arm = texture.slim ? 3 : 4;
  const side = 4 + arm / 2;
  const { legacy } = texture;

  return (
    <>
      <Part cuboid={[0, 0, 8, 8, 8]} at={[0, -12, 0]} texture={texture} />
      <Part cuboid={[16, 16, 8, 12, 4]} at={[0, -2, 0]} texture={texture} />
      <Part cuboid={[40, 16, arm, 12, 4]} at={[-side, -2, 0]} texture={texture} />
      <Part cuboid={legacy ? [40, 16, arm, 12, 4] : [32, 48, arm, 12, 4]} at={[side, -2, 0]} texture={texture} mirror={legacy} />
      <Part cuboid={[0, 16, 4, 12, 4]} at={[-2, 10, 0]} texture={texture} />
      <Part cuboid={legacy ? [0, 16, 4, 12, 4] : [16, 48, 4, 12, 4]} at={[2, 10, 0]} texture={texture} mirror={legacy} />
      <Part cuboid={[32, 0, 8, 8, 8]} at={[0, -12, 0]} texture={texture} inflate={0.5} />
      {!legacy && (
        <>
          <Part cuboid={[16, 32, 8, 12, 4]} at={[0, -2, 0]} texture={texture} inflate={0.25} />
          <Part cuboid={[40, 32, arm, 12, 4]} at={[-side, -2, 0]} texture={texture} inflate={0.25} />
          <Part cuboid={[48, 48, arm, 12, 4]} at={[side, -2, 0]} texture={texture} inflate={0.25} />
          <Part cuboid={[0, 32, 4, 12, 4]} at={[-2, 10, 0]} texture={texture} inflate={0.25} />
          <Part cuboid={[0, 48, 4, 12, 4]} at={[2, 10, 0]} texture={texture} inflate={0.25} />
        </>
      )}
    </>
  );
}

/**
 * The skin panel: the skin in 3D, turned by dragging (only sideways on a touch screen, so a vertical swipe still
 * scrolls) or with the arrow keys, its texture as uploaded, and a download. The player page loads this module, and the
 * texture, only when the panel opens.
 */
export function SkinPanel({ id, uuid, name }: { id: string; uuid: string; name: string }) {
  const { t } = useTranslation();
  const src = `/api/skin/texture?uuid=${uuid}`;
  const [texture, setTexture] = useState<Texture | "error">();
  const [angle, setAngle] = useState({ yaw: -30, pitch: -10 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  useRevealOnOpen(id);

  // Fetched rather than loaded as an image, for `X-Skin-Model`: the game takes the arm width from the account, not the
  // texture.
  useEffect(() => {
    const controller = new AbortController();
    let url = "";

    fetch(src, { signal: controller.signal })
      .then(async (response): Promise<Texture> => {
        if (!response.ok) throw new Error(`The skin texture answered ${response.status}`);
        url = URL.createObjectURL(await response.blob());
        const image = new Image();
        image.src = url;
        await image.decode();
        return { src: url, slim: response.headers.get("X-Skin-Model") === "slim", legacy: image.naturalHeight === 32 };
      })
      .then(setTexture)
      .catch(() => {
        if (!controller.signal.aborted) setTexture("error");
      });

    return () => {
      controller.abort();
      URL.revokeObjectURL(url);
    };
  }, [src]);

  const turn = (yaw: number, pitch: number) =>
    setAngle((angle) => ({ yaw: angle.yaw + yaw, pitch: Math.max(-MAX_PITCH, Math.min(MAX_PITCH, angle.pitch + pitch)) }));

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const [dx, dy] = [event.clientX - drag.current.x, event.clientY - drag.current.y];
    drag.current = { x: event.clientX, y: event.clientY };
    turn(dx * DRAG, event.pointerType === "mouse" ? -dy * DRAG : 0);
  };

  // A slider's keys: Right and Up turn it one way, Left and Down the other.
  const keys: Record<string, number> = { ArrowRight: STEP, ArrowUp: STEP, ArrowLeft: -STEP, ArrowDown: -STEP };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = keys[event.key];
    if (!step) return;
    event.preventDefault();
    turn(step, 0);
  };
  const degrees = ((Math.round(angle.yaw) % 360) + 360) % 360;

  return (
    <Box id={id} title={<h2 className="text-mc-1.5">{t("player.skin.title")}</h2>} className="content:flex content:flex-col content:gap-4">
      {texture === "error" ?
        <p className="self-center text-mc-1 text-mc-red">{t("player.skin.error")}</p> :
        (
          <div className="flex flex-col items-center gap-6 self-center sm:flex-row sm:items-end">
            {/* A slider for the side-to-side turn, the one a keyboard or screen reader gets; a mouse can tilt it too. */}
            <div
              role="slider"
              aria-label={t("player.skin.label", { name })}
              aria-valuemin={0}
              aria-valuemax={359}
              aria-valuenow={degrees}
              aria-valuetext={t("player.skin.angle", { degrees })}
              tabIndex={0}
              onKeyDown={onKeyDown}
              onPointerDown={(event) => {
                drag.current = { x: event.clientX, y: event.clientY };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={onPointerMove}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              className="relative h-80 w-64 cursor-grab touch-pan-y select-none perspective-[1000px] active:cursor-grabbing"
            >
              {texture && (
                <div
                  className="absolute top-1/2 left-1/2 transform-3d"
                  style={{ transform: `rotateX(${angle.pitch}deg) rotateY(${angle.yaw}deg)` }}
                >
                  <Model texture={texture} />
                </div>
              )}
            </div>
            {/* Its box is held from the start, so the panel opens at its full height and the download is in view. */}
            <img
              src={src}
              alt={t("player.skin.file", { name })}
              width={128}
              height={texture?.legacy ? 64 : 128}
              className={texture ? "[image-rendering:pixelated]" : "invisible [image-rendering:pixelated]"}
            />
          </div>
        )}
      <Button asChild className="self-center sm:min-w-48">
        <a href={src} download={`${name}-skin.png`}>
          {t("player.skin.download")}
        </a>
      </Button>
    </Box>
  );
}
