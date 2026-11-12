use napi::bindgen_prelude::*;
use napi_derive::napi;
use tokio::sync::OnceCell;

use crate::armor::Armor;
use crate::model::{ModelKind, ModelOuterLayer};
use crate::pose::Pose;
use crate::renderer::native::NativeBackend;
use crate::renderer::SkinRenderer;

const DEFAULT_WIDTH: u32 = 460;
const DEFAULT_HEIGHT: u32 = 800;

static SKIN_RENDERER: OnceCell<SkinRenderer<NativeBackend>> = OnceCell::const_new();

#[napi(object)]
#[derive(Default)]
pub struct RenderOptions {
  pub armor: Option<Armor>,
  /// Enchantment glint texture (PNG), needed when an armour piece is enchanted.
  pub glint: Option<Uint8Array>,
  /// Cape texture (PNG).
  pub cape: Option<Uint8Array>,
  /// Camera angle around the player in radians: 0 faces the front, π the back.
  /// Defaults to -0.3.
  pub yaw: Option<f64>,
  #[napi(ts_type = "'standing' | 'punch' | 'sneak' | 'jump' | 'swim' | 'fly'")]
  pub pose: Option<Pose>,
  /// Output width in pixels, from 16 to 2048 and at most 4 times the height. Defaults to 460.
  pub width: Option<u32>,
  /// Output height in pixels, from 16 to 2048 and at most 4 times the width. Defaults to 800.
  pub height: Option<u32>,
}

#[napi]
pub async fn render_skin(
  skin: &[u8],
  slim: bool,
  extruded: bool,
  options: Option<RenderOptions>,
) -> Result<Buffer> {
  let renderer = SKIN_RENDERER
    .get_or_try_init(|| SkinRenderer::new(DEFAULT_WIDTH, DEFAULT_HEIGHT))
    .await?;

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

  let options = options.unwrap_or_default();
  let armor = options.armor.unwrap_or_default();

  // Checked after narrowing, since a huge f64 becomes an f32 infinity
  let yaw = options.yaw.map(|yaw| yaw as f32);

  if yaw.is_some_and(|yaw| !yaw.is_finite()) {
    return Err(crate::error::Error::InvalidYaw.into());
  }

  let model = renderer.load_skin(
    skin,
    model_kind,
    model_outer_layer,
    &armor,
    options.glint.as_deref(),
    options.cape.as_deref(),
    options.pose.unwrap_or_default(),
  )?;
  let png = renderer
    .render(
      &model,
      yaw,
      options.width.unwrap_or(DEFAULT_WIDTH),
      options.height.unwrap_or(DEFAULT_HEIGHT),
    )
    .await?;

  Ok(png.into())
}
