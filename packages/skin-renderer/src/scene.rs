use std::collections::HashMap;
use std::f32::consts::FRAC_PI_2;
use std::sync::{Arc, Mutex, PoisonError};

use cgmath::{Array, EuclideanSpace, Point3, SquareMatrix, Transform as _, Vector3};
use image::{DynamicImage, RgbaImage};
use napi::bindgen_prelude::*;
use napi_derive::napi;
use statsify_minecraft_models::{bake_model, load_texture, Display, Pack};
use statsify_render_core::camera::{Camera, OrbitalCamera};
use statsify_render_core::geometry::vertex::Vertex;
use statsify_render_core::geometry::Geometry;
use statsify_render_core::material::Material;
use statsify_render_core::mesh::Mesh;
use statsify_render_core::renderer::native::NativeBackend;
use statsify_render_core::renderer::{DrawItem, Pipeline, Renderer};

use crate::armor::Armor;
use crate::attachment::{
  bone_transform, item_transform, local_transform, root_transform, Bone, DisplayContext, Wearer,
};
use crate::error::Error;
use crate::model::{Model, ModelKind, ModelOuterLayer};
use crate::native::renderer;
use crate::pose::Pose;

// Of the output's shorter side, left clear on each side of the scene
const MARGIN: f32 = 0.04;

#[napi(object)]
pub struct PackAssets {
  /// Model JSON by name under `models`, such as `block/furnace`.
  pub models: HashMap<String, String>,
  /// Texture PNGs by name under `textures`, such as `items/hypixel_kart_red`.
  pub textures: HashMap<String, Uint8Array>,
  /// Animation metadata (`.png.mcmeta`) by the name of its texture.
  pub mcmeta: HashMap<String, String>,
}

#[napi(object)]
pub struct ScenePlayer {
  pub skin: Uint8Array,
  pub slim: bool,
  pub extruded: bool,
  pub armor: Option<Armor>,
  /// Enchantment glint texture (PNG), needed when an armor piece is enchanted.
  pub glint: Option<Uint8Array>,
  /// Cape texture (PNG).
  pub cape: Option<Uint8Array>,
  #[napi(ts_type = "'standing' | 'punch' | 'sneak' | 'jump' | 'swim' | 'fly' | 'sit'")]
  pub pose: Option<Pose>,
}

#[napi(object)]
pub struct ModelInstance {
  /// Model name in the library, such as `block/furnace`.
  pub model: String,
  /// What the model hangs from. On `root`, a display context wears it as the game does on an
  /// invisible standing entity where the player stands, such as an armor stand.
  #[napi(ts_type = "'root' | 'head' | 'rightHand' | 'leftHand'")]
  pub bone: Bone,
  /// Which of the model's `display` transforms places it, with the game's chain for a worn
  /// (`head`) or held (`thirdperson`) item. Without one, the model is centered on the bone, a block
  /// to 16 pixels.
  #[napi(ts_type = "'head' | 'thirdperson'")]
  pub display: Option<DisplayContext>,
  /// Moves the placed model in its bone's frame, in pixels (sixteenths of a block).
  pub translation: Option<(f64, f64, f64)>,
  /// Degrees about the bone's x, y and z axes, turned in the order a display transform turns.
  pub rotation: Option<(f64, f64, f64)>,
  pub scale: Option<(f64, f64, f64)>,
}

#[napi(object)]
pub struct Scene {
  pub player: Option<ScenePlayer>,
  pub models: Vec<ModelInstance>,
}

#[napi(object)]
pub struct SceneOutput {
  // Taken as numbers and checked here, since napi wraps or truncates a number into a u32
  pub width: f64,
  pub height: f64,
  /// Camera angle around the scene in radians: 0 faces the player's front, π the back.
  pub yaw: f64,
  /// Camera angle above the horizon in radians.
  pub pitch: f64,
}

struct LoadedTexture {
  material: Material,
  translucent: bool,
}

struct LoadedPart {
  mesh: Mesh,
  texture: Arc<LoadedTexture>,
  points: Vec<Point3<f32>>,
}

struct LoadedModel {
  parts: Vec<LoadedPart>,
  display: Display,
}

#[derive(Default)]
struct Cache {
  models: HashMap<String, Arc<LoadedModel>>,
  textures: HashMap<String, Arc<LoadedTexture>>,
}

/// A resource pack's models and textures, baked and uploaded the first time a scene uses them.
#[napi]
#[derive(Clone)]
pub struct ModelLibrary {
  pack: Arc<Pack>,
  cache: Arc<Mutex<Cache>>,
}

#[napi]
impl ModelLibrary {
  #[napi(constructor)]
  pub fn new(assets: PackAssets) -> Self {
    let pack = Pack {
      models: assets.models,
      textures: assets
        .textures
        .into_iter()
        .map(|(name, bytes)| (name, bytes.to_vec()))
        .collect(),
      mcmeta: assets.mcmeta,
    };

    Self {
      pack: Arc::new(pack),
      cache: Arc::default(),
    }
  }
}

impl ModelLibrary {
  fn model(
    &self,
    renderer: &Renderer<NativeBackend>,
    name: &str,
  ) -> crate::error::Result<Arc<LoadedModel>> {
    // A load either finishes before it's cached or leaves the cache untouched
    let mut cache = self.cache.lock().unwrap_or_else(PoisonError::into_inner);

    if let Some(model) = cache.models.get(name) {
      return Ok(Arc::clone(model));
    }

    let baked = bake_model(&self.pack, name)?;
    let mut parts = Vec::with_capacity(baked.submeshes.len());

    for submesh in baked.submeshes {
      let texture = match cache.textures.get(&submesh.texture) {
        Some(texture) => Arc::clone(texture),
        None => {
          let texture = Arc::new(self.upload_texture(renderer, &submesh.texture)?);
          cache
            .textures
            .insert(submesh.texture.clone(), Arc::clone(&texture));
          texture
        }
      };

      let points = submesh
        .vertices
        .iter()
        .map(|vertex| Point3::from(vertex.position))
        .collect();

      let vertices = submesh
        .vertices
        .iter()
        .map(|vertex| Vertex::new(vertex.position, vertex.uv, vertex.normal))
        .collect();

      parts.push(LoadedPart {
        mesh: Mesh::from_geometry(renderer.device(), Geometry::new(vertices, submesh.indices)),
        texture,
        points,
      });
    }

    let model = Arc::new(LoadedModel {
      parts,
      display: baked.display,
    });

    cache.models.insert(name.to_string(), Arc::clone(&model));
    Ok(model)
  }

  // Animated strips show their first frame
  fn upload_texture(
    &self,
    renderer: &Renderer<NativeBackend>,
    name: &str,
  ) -> crate::error::Result<LoadedTexture> {
    let texture = load_texture(&self.pack, name, 0)?;

    let image = RgbaImage::from_raw(texture.width, texture.height, texture.rgba)
      .expect("a loaded texture holds every texel");

    Ok(LoadedTexture {
      material: Material::new(
        renderer.device(),
        renderer.queue(),
        renderer.texture_bind_group_layout(),
        renderer.sampler(),
        &DynamicImage::ImageRgba8(image),
      )?,
      translucent: texture.translucent,
    })
  }
}

#[napi]
pub async fn render_scene(
  library: &ModelLibrary,
  scene: Scene,
  output: SceneOutput,
) -> Result<Buffer> {
  let renderer = renderer().await?;
  let library = library.clone();

  // Baking, loading and rendering block the thread, so they run off napi's async workers
  let buffer = spawn_blocking(move || draw_scene(renderer, &library, scene, output))
    .await
    .map_err(|_| Error::from(statsify_render_core::Error::RenderFailure))??;

  Ok(buffer.into())
}

fn draw_scene(
  renderer: &Renderer<NativeBackend>,
  library: &ModelLibrary,
  scene: Scene,
  output: SceneOutput,
) -> Result<Vec<u8>> {
  let limit = renderer.device().limits().max_texture_dimension_2d;
  let (width, height) = (pixels(output.width, limit)?, pixels(output.height, limit)?);

  // Checked after narrowing, since a huge f64 becomes an f32 infinity
  let (yaw, pitch) = (output.yaw as f32, output.pitch as f32);

  if !yaw.is_finite() {
    return Err(Error::InvalidYaw.into());
  }

  if !pitch.is_finite() {
    return Err(Error::InvalidPitch.into());
  }

  let player = match &scene.player {
    Some(player) => {
      let kind = if player.slim {
        ModelKind::Slim
      } else {
        ModelKind::Classic
      };

      let outer_layer = if player.extruded {
        ModelOuterLayer::D3
      } else {
        ModelOuterLayer::D2
      };

      let wearer = Wearer {
        arm_width: kind.arm_width(),
        pose: player.pose.unwrap_or_default(),
      };

      let model = Model::load(
        renderer,
        &player.skin,
        kind,
        outer_layer,
        player.armor.as_ref().unwrap_or(&Armor::default()),
        player.glint.as_deref(),
        player.cape.as_deref(),
        wearer.pose,
      )?;

      Some((model, wearer))
    }
    None => None,
  };

  let mut models = Vec::with_capacity(scene.models.len());
  let mut points = Vec::new();

  for instance in &scene.models {
    let bone = match (instance.bone, &player) {
      (Bone::Root, _) => root_transform(instance.display),
      (bone, Some((_, wearer))) => bone_transform(bone, wearer),
      (_, None) => return Err(Error::MissingPlayer.into()),
    };

    let triple = |value: Option<(f64, f64, f64)>, default: f32| {
      value.map_or([default; 3], |(x, y, z)| [x as f32, y as f32, z as f32])
    };

    let (translation, rotation, scale) = (
      triple(instance.translation, 0.0),
      triple(instance.rotation, 0.0),
      triple(instance.scale, 1.0),
    );

    let invalid = || Error::InvalidTransform(instance.model.clone());

    // Checked after narrowing, since a huge f64 becomes an f32 infinity
    let finite = [translation, rotation, scale]
      .iter()
      .flatten()
      .all(|value| value.is_finite());

    if !finite || scale.contains(&0.0) {
      return Err(invalid().into());
    }

    let model = library.model(renderer, &instance.model)?;

    let hidden = instance
      .display
      .and_then(|context| context.entry(&model.display))
      .is_some_and(|entry| entry.scale.contains(&0.0));

    if hidden {
      continue;
    }

    let transform = bone
      * local_transform(translation, rotation, scale)
      * item_transform(instance.display, &model.display);

    let start = points.len();

    points.extend(
      model
        .parts
        .iter()
        .flat_map(|part| &part.points)
        .map(|&point| transform.transform_point(point).to_vec()),
    );

    // Finite values can still overflow once multiplied through the chain, and the normals need
    // an inverse that neither overflows nor underflows
    if !transform.determinant().is_normal() || !points[start..].iter().all(Array::is_finite) {
      return Err(invalid().into());
    }

    models.push((model, transform));
  }

  let mut items = Vec::new();

  for (model, transform) in &models {
    for part in &model.parts {
      items.push(DrawItem {
        mesh: &part.mesh,
        material: &part.texture.material,
        pipeline: if part.texture.translucent {
          Pipeline::Translucent
        } else {
          Pipeline::Cutout
        },
        transform: *transform,
      });
    }
  }

  // The player's partly transparent texels blend after the opaque ones instead of writing depth,
  // which would hide a translucent model behind them
  if let Some((model, _)) = &player {
    items.extend(model.draw_items().into_iter().map(|item| DrawItem {
      pipeline: Pipeline::Worn(match item.pipeline {
        Pipeline::Enchanted(glint) => Some(glint),
        _ => None,
      }),
      ..item
    }));

    points.extend_from_slice(model.points());
  }

  if points.is_empty() {
    return Err(Error::EmptyScene.into());
  }

  if points.iter().all(|point| *point == points[0]) {
    return Err(Error::SceneOutOfRange.into());
  }

  let middle = points.iter().sum::<Vector3<f32>>() / points.len() as f32;

  let camera = OrbitalCamera::new(Point3::from_vec(middle), width as f32, height as f32)
    .with_theta(yaw)
    .with_phi(FRAC_PI_2 - pitch)
    .framed(&points, MARGIN * width.min(height) as f32)
    .ok_or(Error::SceneOutOfRange)?;

  let buffer = renderer
    .render_sized(&items, &Camera::Orbital(camera), width, height)
    .map_err(Error::from)?;

  Ok(buffer)
}

fn pixels(side: f64, limit: u32) -> crate::error::Result<u32> {
  if side.fract() == 0.0 && (1.0..=f64::from(limit)).contains(&side) {
    Ok(side as u32)
  } else {
    Err(statsify_render_core::Error::OutputSize(limit).into())
  }
}
