/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Direction, Model, ModelElement, ModelFace, Transform } from "./models.js";
import { createImageData } from "./canvas.js";

export type Vec3 = [number, number, number];
type Vec2 = [number, number];
type Mat3 = [number, number, number, number, number, number, number, number, number];

/** A textured rectangle in block pixels (0 to 16), with uvs from 0 to 1 */
export interface Quad {
  corners: [Vec3, Vec3, Vec3, Vec3];
  uvs: [Vec2, Vec2, Vec2, Vec2];
  texture: ImageData;
  tint?: number;
  shade: boolean;
}

const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

function multiply(a: Mat3, b: Mat3): Mat3 {
  const out = Array.from({ length: 9 }, (_, i) => {
    const row = Math.floor(i / 3);
    const column = i % 3;
    return a[row * 3] * b[column] + a[row * 3 + 1] * b[3 + column] + a[row * 3 + 2] * b[6 + column];
  });

  return out as Mat3;
}

const apply = (m: Mat3, [x, y, z]: Vec3): Vec3 => [
  m[0] * x + m[1] * y + m[2] * z,
  m[3] * x + m[4] * y + m[5] * z,
  m[6] * x + m[7] * y + m[8] * z,
];

function rotation(axis: "x" | "y" | "z", degrees: number): Mat3 {
  const radians = (degrees * Math.PI) / 180;
  const c = Math.cos(radians);
  const s = Math.sin(radians);

  switch (axis) {
    case "x":
      return [1, 0, 0, 0, c, -s, 0, s, c];
    case "y":
      return [c, 0, s, 0, 1, 0, -s, 0, c];
    case "z":
      return [c, -s, 0, s, c, 0, 0, 0, 1];
  }
}

type Quaternion = [x: number, y: number, z: number, w: number];

function quaternion([x, y, z, w]: Quaternion): Mat3 {
  return [
    1 - 2 * (y * y + z * z),
    2 * (x * y - z * w),
    2 * (x * z + y * w),
    2 * (x * y + z * w),
    1 - 2 * (x * x + z * z),
    2 * (y * z - x * w),
    2 * (x * z - y * w),
    2 * (y * z + x * w),
    1 - 2 * (x * x + y * y),
  ];
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/** A special model's transformation, with its translation in blocks */
export interface Transformation {
  left_rotation?: Quaternion;
  right_rotation?: Quaternion;
  scale?: Vec3;
  translation?: Vec3;
}

/** Moves quads from a special model's own space into block pixels */
export function transformQuads(quads: Quad[], transformation: Transformation = {}): Quad[] {
  const [sx, sy, sz] = transformation.scale ?? [1, 1, 1];
  const matrix = multiply(
    multiply(quaternion(transformation.left_rotation ?? [0, 0, 0, 1]), [sx, 0, 0, 0, sy, 0, 0, 0, sz]),
    quaternion(transformation.right_rotation ?? [0, 0, 0, 1]),
  );
  const [tx, ty, tz] = transformation.translation ?? [0, 0, 0];

  return quads.map((quad) => ({
    ...quad,
    corners: quad.corners.map((corner) => {
      const [x, y, z] = apply(matrix, corner);
      return [x + tx * 16, y + ty * 16, z + tz * 16];
    }) as Quad["corners"],
  }));
}

// The corners of each face in the order Minecraft assigns uvs to them (FaceInfo)
const FACE_CORNERS: Record<Direction, (from: Vec3, to: Vec3) => Vec3[]> = {
  down: (f, t) => [[f[0], f[1], t[2]], [f[0], f[1], f[2]], [t[0], f[1], f[2]], [t[0], f[1], t[2]]],
  up: (f, t) => [[f[0], t[1], f[2]], [f[0], t[1], t[2]], [t[0], t[1], t[2]], [t[0], t[1], f[2]]],
  north: (f, t) => [[t[0], t[1], f[2]], [t[0], f[1], f[2]], [f[0], f[1], f[2]], [f[0], t[1], f[2]]],
  south: (f, t) => [[f[0], t[1], t[2]], [f[0], f[1], t[2]], [t[0], f[1], t[2]], [t[0], t[1], t[2]]],
  west: (f, t) => [[f[0], t[1], f[2]], [f[0], f[1], f[2]], [f[0], f[1], t[2]], [f[0], t[1], t[2]]],
  east: (f, t) => [[t[0], t[1], t[2]], [t[0], f[1], t[2]], [t[0], f[1], f[2]], [t[0], t[1], f[2]]],
};

// The uvs a face gets from its element's position when it doesn't list any
const DEFAULT_UVS: Record<Direction, (from: Vec3, to: Vec3) => [number, number, number, number]> = {
  down: (f, t) => [f[0], 16 - t[2], t[0], 16 - f[2]],
  up: (f, t) => [f[0], f[2], t[0], t[2]],
  north: (f, t) => [16 - t[0], 16 - t[1], 16 - f[0], 16 - f[1]],
  south: (f, t) => [f[0], 16 - t[1], t[0], 16 - f[1]],
  west: (f, t) => [f[2], 16 - t[1], t[2], 16 - f[1]],
  east: (f, t) => [16 - t[2], 16 - t[1], 16 - f[2], 16 - f[1]],
};

/** A block model element's faces, with each face's texture and tint looked up by the caller */
export function elementQuads(
  element: ModelElement,
  look: (face: ModelFace) => { texture: ImageData; tint?: number },
): Quad[] {
  let matrix = IDENTITY;
  let scale: Vec3 = [1, 1, 1];

  if (element.rotation) {
    const { axis, angle, rescale } = element.rotation;
    matrix = rotation(axis, angle);

    if (rescale) {
      const factor = 1 / Math.cos((angle * Math.PI) / 180);
      scale = [axis === "x" ? 1 : factor, axis === "y" ? 1 : factor, axis === "z" ? 1 : factor];
    }
  }

  const origin = element.rotation?.origin ?? [8, 8, 8];

  // Elements turn about their origin and then stretch back out when rescaled
  const place = (corner: Vec3): Vec3 => {
    const turned = apply(matrix, sub(corner, origin));
    return [
      turned[0] * scale[0] + origin[0],
      turned[1] * scale[1] + origin[1],
      turned[2] * scale[2] + origin[2],
    ];
  };

  return (Object.entries(element.faces) as [Direction, ModelFace][]).map(([direction, face]) => {
    const [u1, v1, u2, v2] = face.uv ?? DEFAULT_UVS[direction](element.from, element.to);
    const uvCorners: Vec2[] = [
      [u1, v1],
      [u1, v2],
      [u2, v2],
      [u2, v1],
    ];
    const shift = Math.round((face.rotation ?? 0) / 90);

    return {
      corners: FACE_CORNERS[direction](element.from, element.to).map(place) as Quad["corners"],
      uvs: [0, 1, 2, 3].map((i) => {
        const [u, v] = uvCorners[(i + shift) % 4];
        return [u / 16, v / 16];
      }) as Quad["uvs"],
      ...look(face),
      shade: element.shade ?? true,
    };
  });
}

/**
 * An entity model cube, laid out on its texture the way Minecraft's ModelPart.Cube is. Entity
 * models put y downwards, which the special model's transformation undoes.
 */
export function boxQuads(
  origin: Vec3,
  size: Vec3,
  [u, v]: Vec2,
  texture: ImageData,
  inflate = 0,
): Quad[] {
  const [w, h, d] = size;
  const [x1, y1, z1] = origin.map((value) => value - inflate);
  const [x2, y2, z2] = origin.map((value, i) => value + size[i] + inflate);

  const a: Vec3 = [x1, y1, z1];
  const b: Vec3 = [x2, y1, z1];
  const c: Vec3 = [x2, y2, z1];
  const dd: Vec3 = [x1, y2, z1];
  const e: Vec3 = [x1, y1, z2];
  const f: Vec3 = [x2, y1, z2];
  const g: Vec3 = [x2, y2, z2];
  const hh: Vec3 = [x1, y2, z2];

  const polygon = (corners: Quad["corners"], pu1: number, pv1: number, pu2: number, pv2: number): Quad => ({
    corners,
    uvs: [
      [pu2 / texture.width, pv1 / texture.height],
      [pu1 / texture.width, pv1 / texture.height],
      [pu1 / texture.width, pv2 / texture.height],
      [pu2 / texture.width, pv2 / texture.height],
    ],
    texture,
    shade: true,
  });

  return [
    polygon([f, b, c, g], u + d + w, v + d, u + d + w + d, v + d + h),
    polygon([a, e, hh, dd], u, v + d, u + d, v + d + h),
    polygon([f, e, a, b], u + d, v, u + d + w, v + d),
    polygon([c, dd, hh, g], u + d + w, v + d, u + d + w + w, v),
    polygon([b, a, dd, c], u + d, v + d, u + d + w, v + d + h),
    polygon([e, f, g, hh], u + d + w + d, v + d, u + d + w + d + w, v + d + h),
  ];
}

// The two lights Minecraft sets up for 3D items in a GUI (Lighting.setupFor3DItems), moved
// into model space after the y flip GUI rendering applies
const LIGHT_0: Vec3 = [-0.9334, 0.2627, -0.2443];
const LIGHT_1: Vec3 = [-0.1036, 0.9766, 0.1884];

const brightness = (normal: Vec3) =>
  Math.min(1, 0.4 + 0.6 * (Math.max(0, dot(normal, LIGHT_0)) + Math.max(0, dot(normal, LIGHT_1))));

function displayMatrix(display?: Transform): Mat3 {
  const [rx, ry, rz] = display?.rotation ?? [0, 0, 0];
  return multiply(multiply(rotation("x", rx), rotation("y", ry)), rotation("z", rz));
}

/**
 * Draws quads the way Minecraft draws a 3D item in a slot: through the model's gui display
 * transform, with an orthographic camera, back faces culled, nearest-texel sampling, cutout
 * below 10% alpha and the GUI's side lighting. The result is 16 × scale pixels square.
 */
export function rasterize(quads: Quad[], display: Transform | undefined, light: Model["guiLight"], scale: number) {
  const size = 16 * scale;
  const pixels = createImageData(size, size);
  const depth = new Float32Array(size * size).fill(-Infinity);

  const matrix = displayMatrix(display);
  const [sx, sy, sz] = display?.scale ?? [1, 1, 1];
  const [tx, ty, tz] = display?.translation ?? [0, 0, 0];

  const faces = quads
    .map((quad) => {
      const points = quad.corners.map((corner) => {
        const [x, y, z] = apply(matrix, [(corner[0] - 8) * sx, (corner[1] - 8) * sy, (corner[2] - 8) * sz]);
        return [x + tx, y + ty, z + tz] as Vec3;
      });

      const normal = cross(sub(points[1], points[0]), sub(points[3], points[0]));
      const length = Math.hypot(...normal);

      return {
        quad,
        normal: normal.map((value) => value / length) as Vec3,
        // Screen pixels, y down, and depth towards the camera
        screen: points.map(([x, y, z]) => [(8 + x) * scale, (8 - y) * scale, z] as Vec3),
        depth: points.reduce((total, point) => total + point[2], 0) / 4,
      };
    })
    .filter(({ normal }) => normal[2] > 1e-6)
    .toSorted((a, b) => a.depth - b.depth);

  for (const { quad, normal, screen } of faces) {
    const shade = light === "side" && quad.shade ? brightness(normal) : 1;
    const tint = quad.tint ?? 0xff_ff_ff;
    const red = (((tint >> 16) & 0xff) / 255) * shade;
    const green = (((tint >> 8) & 0xff) / 255) * shade;
    const blue = ((tint & 0xff) / 255) * shade;

    // Orthographic projection keeps every rectangle a parallelogram, so a pixel's place on
    // the face is p0 + s (p1 - p0) + t (p3 - p0)
    const [p0, p1, , p3] = screen;
    const ax = p1[0] - p0[0];
    const ay = p1[1] - p0[1];
    const bx = p3[0] - p0[0];
    const by = p3[1] - p0[1];
    const determinant = ax * by - ay * bx;
    if (Math.abs(determinant) < 1e-9) continue;

    const xs = screen.map((point) => point[0]);
    const ys = screen.map((point) => point[1]);
    const left = Math.max(0, Math.floor(Math.min(...xs)));
    const right = Math.min(size - 1, Math.ceil(Math.max(...xs)));
    const top = Math.max(0, Math.floor(Math.min(...ys)));
    const bottom = Math.min(size - 1, Math.ceil(Math.max(...ys)));

    const { texture, uvs } = quad;

    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        const dx = x + 0.5 - p0[0];
        const dy = y + 0.5 - p0[1];
        const s = (dx * by - dy * bx) / determinant;
        const t = (ax * dy - ay * dx) / determinant;
        if (s < 0 || s >= 1 || t < 0 || t >= 1) continue;

        const z = p0[2] + s * (screen[1][2] - p0[2]) + t * (screen[3][2] - p0[2]);
        const index = y * size + x;
        if (z < depth[index]) continue;

        const u = uvs[0][0] + s * (uvs[1][0] - uvs[0][0]) + t * (uvs[3][0] - uvs[0][0]);
        const v = uvs[0][1] + s * (uvs[1][1] - uvs[0][1]) + t * (uvs[3][1] - uvs[0][1]);
        const texelX = Math.min(texture.width - 1, Math.max(0, Math.floor(u * texture.width)));
        const texelY = Math.min(texture.height - 1, Math.max(0, Math.floor(v * texture.height)));
        const texel = (texelY * texture.width + texelX) * 4;

        const alpha = texture.data[texel + 3];
        if (alpha < 26) continue;

        const out = index * 4;
        const r = texture.data[texel] * red;
        const g = texture.data[texel + 1] * green;
        const b = texture.data[texel + 2] * blue;

        if (alpha === 255) {
          pixels.data[out] = r;
          pixels.data[out + 1] = g;
          pixels.data[out + 2] = b;
          pixels.data[out + 3] = 255;
          depth[index] = z;
        } else {
          // Translucent faces blend over what's behind them without hiding it
          const a = alpha / 255;
          const below = pixels.data[out + 3] / 255;
          const total = a + below * (1 - a);

          pixels.data[out] = (r * a + pixels.data[out] * below * (1 - a)) / total;
          pixels.data[out + 1] = (g * a + pixels.data[out + 1] * below * (1 - a)) / total;
          pixels.data[out + 2] = (b * a + pixels.data[out + 2] * below * (1 - a)) / total;
          pixels.data[out + 3] = total * 255;
        }
      }
    }
  }

  return pixels;
}
