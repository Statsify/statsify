use std::f32::consts::{FRAC_PI_3, FRAC_PI_6};

use cgmath::{
  EuclideanSpace, Matrix4, Point3, Quaternion, Rad, Rotation3, Transform as _, Vector3,
};
use image::{imageops, DynamicImage, RgbaImage};
use napi::bindgen_prelude::Uint8Array;
use napi_derive::napi;
use statsify_minecraft_models::ALPHA_CUTOFF;
use statsify_render_core::material::Material;
use statsify_render_core::mesh::Mesh;
use statsify_render_core::renderer::{Backend, DrawItem, Pipeline, Renderer};
use statsify_render_core::texture::Texture;

use crate::attachment::{FEET, MODEL_HEIGHT, PIXELS_PER_BLOCK, PLAYER_SCALE};
use crate::error::{Error, Result};
use crate::geometry::{BoxGeometry, Geometry, Rotation, TextureRegion};

#[napi(string_enum = "camelCase", skip_typescript)]
#[derive(Clone, Copy)]
pub enum MountEntity {
  Horse,
  Donkey,
}

#[napi(object)]
pub struct SceneMount {
  /// The 1.8 entity, saddled and standing still. Zombie and skeleton horses are horses with
  /// their own texture.
  #[napi(ts_type = "'horse' | 'donkey'")]
  pub entity: MountEntity,
  /// Texture layers (PNG) drawn over each other into one texture, as the game layers a horse's
  /// coat, markings and armor.
  pub textures: Vec<Uint8Array>,
}

// In blocks: three quarters of a horse's 1.6 block height, less the 0.35 a player rides below that
const SEAT: f32 = 1.6 * 0.75 - 0.35;

// The model's y of the seat's front and back boards, which the rider's thighs rest on
const SADDLE_TOP: f32 = 1.0;

const HORSE_TEXTURE_SIZE: (u32, u32) = (128, 128);

// A box as the game declares it in an entity's model space (y down, the front toward -z): its
// part's pivot and angles in radians (turned about z, y, then x), then its corner and size
struct ModelBox {
  pivot: [f32; 3],
  angles: [f32; 3],
  from: [f32; 3],
  size: [f32; 3],
  uv: (u32, u32),
  inflation: f32,
}

const fn model_box(
  pivot: [f32; 3],
  angles: [f32; 3],
  from: [f32; 3],
  size: [f32; 3],
  uv: (u32, u32),
) -> ModelBox {
  ModelBox {
    pivot,
    angles,
    from,
    size,
    uv,
    inflation: 0.0,
  }
}

impl ModelBox {
  fn geometry(&self) -> Geometry {
    let axes = |[x, y, z]: [f32; 3]| Vector3::new(x, -y, -z);
    let [width, height, depth] = self.size;
    let [x, y, z] = self.angles;
    let pivot = axes(self.pivot);

    BoxGeometry {
      position: pivot + axes(self.from) + Vector3::new(width, -height, -depth) / 2.0,
      dimensions: Vector3::new(width, height, depth),
      texture_region: TextureRegion {
        location: self.uv,
        texture_size: HORSE_TEXTURE_SIZE,
        mirror: false,
      },
      rotation: Some(Rotation {
        quaternion: Quaternion::from_angle_z(Rad(-z))
          * Quaternion::from_angle_y(Rad(-y))
          * Quaternion::from_angle_x(Rad(x)),
        pivot,
      }),
      inflation: self.inflation,
    }
    .create()
  }
}

const UNTURNED: [f32; 3] = [0.0; 3];

// The head and everything on it tip 30 degrees forward from the neck
const HEAD_PIVOT: [f32; 3] = [0.0, 4.0, -10.0];
const HEAD_ANGLES: [f32; 3] = [FRAC_PI_6, 0.0, 0.0];

// The game's own roundings of the tail's 75 degrees, and of the tip's 15 further
const TAIL: f32 = -1.3089;
const TAIL_TIP: f32 = TAIL - 0.2618;

// A still, adult horse. Donkeys, mules, zombie and skeleton horses share it.
#[rustfmt::skip]
const HORSE: &[ModelBox] = &[
  model_box([0.0, 11.0, 9.0], UNTURNED, [-5.0, -8.0, -19.0], [10.0, 10.0, 24.0], (0, 34)),
  model_box([0.0, 3.0, 14.0], [TAIL, 0.0, 0.0], [-1.0, -1.0, 0.0], [2.0, 2.0, 3.0], (44, 0)),
  model_box([0.0, 3.0, 14.0], [TAIL, 0.0, 0.0], [-1.5, -2.0, 3.0], [3.0, 4.0, 7.0], (38, 7)),
  model_box([0.0, 3.0, 14.0], [TAIL_TIP, 0.0, 0.0], [-1.5, -4.5, 9.0], [3.0, 4.0, 7.0], (24, 3)),
  // Each leg is a thigh, a shin and a hoof: back left, back right, front left, front right
  model_box([4.0, 9.0, 11.0], UNTURNED, [-2.5, -2.0, -2.5], [4.0, 9.0, 5.0], (78, 29)),
  model_box([4.0, 16.0, 11.0], UNTURNED, [-2.0, 0.0, -1.5], [3.0, 5.0, 3.0], (78, 43)),
  model_box([4.0, 16.0, 11.0], UNTURNED, [-2.5, 5.1, -2.0], [4.0, 3.0, 4.0], (78, 51)),
  model_box([-4.0, 9.0, 11.0], UNTURNED, [-1.5, -2.0, -2.5], [4.0, 9.0, 5.0], (96, 29)),
  model_box([-4.0, 16.0, 11.0], UNTURNED, [-1.0, 0.0, -1.5], [3.0, 5.0, 3.0], (96, 43)),
  model_box([-4.0, 16.0, 11.0], UNTURNED, [-1.5, 5.1, -2.0], [4.0, 3.0, 4.0], (96, 51)),
  model_box([4.0, 9.0, -8.0], UNTURNED, [-1.9, -1.0, -2.1], [3.0, 8.0, 4.0], (44, 29)),
  model_box([4.0, 16.0, -8.0], UNTURNED, [-1.9, 0.0, -1.6], [3.0, 5.0, 3.0], (44, 41)),
  model_box([4.0, 16.0, -8.0], UNTURNED, [-2.4, 5.1, -2.1], [4.0, 3.0, 4.0], (44, 51)),
  model_box([-4.0, 9.0, -8.0], UNTURNED, [-1.1, -1.0, -2.1], [3.0, 8.0, 4.0], (60, 29)),
  model_box([-4.0, 16.0, -8.0], UNTURNED, [-1.1, 0.0, -1.6], [3.0, 5.0, 3.0], (60, 41)),
  model_box([-4.0, 16.0, -8.0], UNTURNED, [-1.6, 5.1, -2.1], [4.0, 3.0, 4.0], (60, 51)),
  // Head, upper and lower jaw (the upper one hangs 0.02 down and back), neck and mane
  model_box(HEAD_PIVOT, HEAD_ANGLES, [-2.5, -10.0, -1.5], [5.0, 5.0, 7.0], (0, 0)),
  model_box(HEAD_PIVOT, HEAD_ANGLES, [-2.0, -9.98, -6.98], [4.0, 3.0, 6.0], (24, 18)),
  model_box(HEAD_PIVOT, HEAD_ANGLES, [-2.0, -7.0, -6.5], [4.0, 2.0, 5.0], (24, 27)),
  model_box(HEAD_PIVOT, HEAD_ANGLES, [-2.05, -9.8, -2.0], [4.0, 14.0, 8.0], (0, 12)),
  model_box(HEAD_PIVOT, HEAD_ANGLES, [-1.0, -11.5, 5.0], [2.0, 16.0, 4.0], (58, 0)),
];

#[rustfmt::skip]
const HORSE_EARS: &[ModelBox] = &[
  model_box(HEAD_PIVOT, HEAD_ANGLES, [0.45, -12.0, 4.0], [2.0, 3.0, 1.0], (0, 0)),
  model_box(HEAD_PIVOT, HEAD_ANGLES, [-2.45, -12.0, 4.0], [2.0, 3.0, 1.0], (0, 0)),
];

// Long ears, leaning 15 degrees out
const EAR_LEAN: f32 = FRAC_PI_6 / 2.0;

#[rustfmt::skip]
const DONKEY_EARS: &[ModelBox] = &[
  model_box(HEAD_PIVOT, [FRAC_PI_6, 0.0, EAR_LEAN], [-2.0, -16.0, 4.0], [2.0, 7.0, 1.0], (0, 12)),
  model_box(HEAD_PIVOT, [FRAC_PI_6, 0.0, -EAR_LEAN], [0.0, -16.0, 4.0], [2.0, 7.0, 1.0], (0, 12)),
];

// The bridle, the seat's three boards and the bit's two rings
#[rustfmt::skip]
const SADDLE: &[ModelBox] = &[
  ModelBox {
    inflation: 0.2,
    ..model_box(HEAD_PIVOT, HEAD_ANGLES, [-2.5, -10.1, -7.0], [5.0, 5.0, 12.0], (80, 12))
  },
  model_box([0.0, 2.0, 2.0], UNTURNED, [-5.0, 0.0, -3.0], [10.0, 1.0, 8.0], (80, 0)),
  model_box([0.0, 2.0, 2.0], UNTURNED, [-1.5, -1.0, -3.0], [3.0, 1.0, 2.0], (106, 9)),
  model_box([0.0, 2.0, 2.0], UNTURNED, [-4.0, -1.0, 3.0], [8.0, 1.0, 2.0], (80, 9)),
  model_box(HEAD_PIVOT, HEAD_ANGLES, [1.5, -8.0, -4.0], [1.0, 2.0, 2.0], (74, 13)),
  model_box(HEAD_PIVOT, HEAD_ANGLES, [-2.5, -8.0, -4.0], [1.0, 2.0, 2.0], (74, 13)),
];

// Each stirrup's strap and iron, which a rider's feet swing 60 degrees forward
#[rustfmt::skip]
const fn stirrups(pitch: f32) -> [ModelBox; 4] {
  let angles = [pitch, 0.0, 0.0];

  [
    model_box([5.0, 2.0, 2.0], angles, [-0.5, 0.0, -0.5], [1.0, 6.0, 1.0], (70, 0)),
    model_box([5.0, 2.0, 2.0], angles, [-0.5, 6.0, -1.0], [1.0, 2.0, 2.0], (74, 0)),
    model_box([-5.0, 2.0, 2.0], angles, [-0.5, 0.0, -0.5], [1.0, 6.0, 1.0], (80, 0)),
    model_box([-5.0, 2.0, 2.0], angles, [-0.5, 6.0, -1.0], [1.0, 2.0, 2.0], (74, 4)),
  ]
}

const HANGING_STIRRUPS: [ModelBox; 4] = stirrups(0.0);
const RIDDEN_STIRRUPS: [ModelBox; 4] = stirrups(-FRAC_PI_3);

// Flat strips beside the head, shown only while ridden
#[rustfmt::skip]
const REINS: &[ModelBox] = &[
  model_box(HEAD_PIVOT, UNTURNED, [2.6, -6.0, -6.0], [0.0, 3.0, 16.0], (44, 10)),
  model_box(HEAD_PIVOT, UNTURNED, [-2.6, -6.0, -6.0], [0.0, 3.0, 16.0], (44, 5)),
];

impl MountEntity {
  fn boxes(self, ridden: bool) -> impl Iterator<Item = &'static ModelBox> {
    let ears = match self {
      MountEntity::Horse => HORSE_EARS,
      MountEntity::Donkey => DONKEY_EARS,
    };

    let (stirrups, reins) = if ridden {
      (&RIDDEN_STIRRUPS, REINS)
    } else {
      (&HANGING_STIRRUPS, &[][..])
    };

    HORSE
      .iter()
      .chain(ears)
      .chain(SADDLE)
      .chain(stirrups)
      .chain(reins)
  }

  fn scale(self) -> f32 {
    match self {
      MountEntity::Horse => 1.0,
      MountEntity::Donkey => 0.87,
    }
  }
}

// Scales the entity's model and stands it under its rider
fn placement(scale: f32) -> Matrix4<f32> {
  // The game seats every rider at a horse's height, above a smaller mount's saddle, so a smaller
  // mount stands higher to meet it
  let seat = SEAT * PIXELS_PER_BLOCK - (1.0 - scale) * (MODEL_HEIGHT - SADDLE_TOP);
  let feet = FEET.y - seat / PLAYER_SCALE;
  let size = scale / PLAYER_SCALE;

  Matrix4::from_translation(Vector3::unit_y() * (feet + MODEL_HEIGHT * size))
    * Matrix4::from_scale(size)
}

// The game draws entities unblended, so a texel that passes its alpha test shows whole
fn compose(layers: &[Uint8Array]) -> Result<RgbaImage> {
  let (base, layers) = layers.split_first().ok_or(Error::MissingMountTexture)?;
  let mut texture = image::load_from_memory(base)?.into_rgba8();

  for layer in layers {
    imageops::overlay(
      &mut texture,
      &image::load_from_memory(layer)?.into_rgba8(),
      0,
      0,
    );
  }

  for texel in texture.pixels_mut() {
    texel[3] = if texel[3] > ALPHA_CUTOFF { u8::MAX } else { 0 };
  }

  Ok(texture)
}

pub struct Mount {
  mesh: Mesh,
  material: Material,
  transform: Matrix4<f32>,
  points: Vec<Vector3<f32>>,
}

impl Mount {
  pub fn load<T: Backend>(
    renderer: &Renderer<T>,
    mount: &SceneMount,
    ridden: bool,
  ) -> Result<Self> {
    let texture = compose(&mount.textures)?;
    let mut geometry = Geometry::new(vec![], vec![]);

    for model_box in mount.entity.boxes(ridden) {
      geometry.combine(model_box.geometry());
    }

    let transform = placement(mount.entity.scale());

    let points = geometry
      .vertices
      .iter()
      .map(|vertex| {
        transform
          .transform_point(Point3::from(vertex.position))
          .to_vec()
      })
      .collect();

    let texture = Texture::from_image(
      renderer.device(),
      renderer.queue(),
      &DynamicImage::ImageRgba8(texture),
    )?;

    Ok(Self {
      mesh: Mesh::from_geometry(renderer.device(), geometry),
      material: Material::new(
        renderer.device(),
        texture,
        renderer.texture_bind_group_layout(),
      ),
      transform,
      points,
    })
  }

  pub fn draw_item(&self) -> DrawItem<'_> {
    DrawItem {
      mesh: &self.mesh,
      material: &self.material,
      pipeline: Pipeline::Cutout,
      transform: self.transform,
    }
  }

  pub fn points(&self) -> &[Vector3<f32>] {
    &self.points
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  fn height(entity: MountEntity, model_y: f32) -> f32 {
    let point = placement(entity.scale()).transform_point(Point3::new(0.0, -model_y, 0.0));
    assert!(point.x == 0.0 && point.z == 0.0);
    point.y
  }

  fn assert_close(actual: f32, expected: f32) {
    assert!((actual - expected).abs() < 1e-3, "{actual} != {expected}");
  }

  #[test]
  fn seats_the_rider_on_the_saddle_at_any_scale() {
    // The rider's feet are at -17.125, 0.85 blocks above the ground, and the game's model leaves
    // a horse's hooves 0.025 above it
    assert_close(height(MountEntity::Horse, 24.1), -31.605);

    // The seat's top boards sit just under the seated thighs at -6.9 on every mount, and a
    // smaller one's hooves stand closer to the rider
    for entity in [MountEntity::Horse, MountEntity::Donkey] {
      assert_close(height(entity, SADDLE_TOP), -6.965);
    }
    assert_close(height(MountEntity::Donkey, 24.1), -28.402);
  }
}
