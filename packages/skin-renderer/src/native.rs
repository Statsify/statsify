use napi::bindgen_prelude::*;
use napi_derive::napi;
use statsify_render_core::camera::Camera;
use statsify_render_core::renderer::native::NativeBackend;
use statsify_render_core::renderer::Renderer;
use tokio::sync::OnceCell;

use crate::armor::Armor;
use crate::model::{Model, ModelKind, ModelOuterLayer};
use crate::pose::{Held, Pose};

static SKIN_RENDERER: OnceCell<Renderer<NativeBackend>> = OnceCell::const_new();

pub(crate) async fn renderer() -> crate::error::Result<&'static Renderer<NativeBackend>> {
  Ok(
    SKIN_RENDERER
      .get_or_try_init(|| Renderer::new(460, 800))
      .await?,
  )
}

#[napi(object)]
#[derive(Default)]
pub struct RenderOptions {
  pub armor: Option<Armor>,
  /// Enchantment glint texture (PNG), needed when an armor piece is enchanted.
  pub glint: Option<Uint8Array>,
  /// Cape texture (PNG).
  pub cape: Option<Uint8Array>,
  /// Camera angle around the player in radians: 0 faces the front, π the back.
  /// Defaults to -0.3.
  pub yaw: Option<f64>,
  #[napi(ts_type = "'standing' | 'punch' | 'sneak' | 'jump' | 'swim' | 'fly' | 'sit'")]
  pub pose: Option<Pose>,
}

#[napi]
pub async fn render_skin(
  skin: Uint8Array,
  slim: bool,
  extruded: bool,
  options: Option<RenderOptions>,
) -> Result<Buffer> {
  let renderer = renderer().await?;
  let options = options.unwrap_or_default();

  // Loading and rendering block the thread, so they run off napi's async workers
  let buffer = spawn_blocking(move || draw_skin(renderer, &skin, slim, extruded, options))
    .await
    .map_err(|error| crate::error::Error::RenderPanicked(error.to_string()))??;

  Ok(buffer.into())
}

fn draw_skin(
  renderer: &Renderer<NativeBackend>,
  skin: &[u8],
  slim: bool,
  extruded: bool,
  options: RenderOptions,
) -> Result<Vec<u8>> {
  let model_kind = if slim {
    ModelKind::Slim
  } else {
    ModelKind::Classic
  };

  let model_outer_layer = if extruded {
    ModelOuterLayer::D3
  } else {
    ModelOuterLayer::D2
  };

  let armor = options.armor.unwrap_or_default();

  // Checked after narrowing, since a huge f64 becomes an f32 infinity
  let yaw = options.yaw.map(|yaw| yaw as f32);

  if yaw.is_some_and(|yaw| !yaw.is_finite()) {
    return Err(crate::error::Error::InvalidYaw.into());
  }

  let model = Model::load(
    renderer,
    skin,
    model_kind,
    model_outer_layer,
    &armor,
    options.glint.as_deref(),
    options.cape.as_deref(),
    options.pose.unwrap_or_default(),
    Held::default(),
  )?;

  let camera = match yaw {
    Some(yaw) => renderer.camera().with_theta(yaw),
    None => renderer.camera(),
  };

  let camera = Camera::Orbital(camera.fitted(model.points(), model.camera_radius()));

  let buffer = renderer
    .render(&model.draw_items(), &camera)
    .map_err(crate::error::Error::from)?;

  Ok(buffer)
}
