use napi::bindgen_prelude::*;
use napi_derive::napi;
use tokio::sync::OnceCell;

use crate::armor::Armor;
use crate::model::{ModelKind, ModelOuterLayer};
use crate::pose::Pose;
use crate::renderer::native::NativeBackend;
use crate::renderer::SkinRenderer;

static SKIN_RENDERER: OnceCell<SkinRenderer<NativeBackend>> = OnceCell::const_new();

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
  #[napi(ts_type = "'standing' | 'punch' | 'sneak' | 'jump' | 'swim' | 'fly'")]
  pub pose: Option<Pose>,
}

#[napi]
pub async fn render_skin(
  skin: &[u8],
  slim: bool,
  extruded: bool,
  options: Option<RenderOptions>,
) -> Result<Buffer> {
  let renderer = SKIN_RENDERER
    .get_or_try_init(|| SkinRenderer::new(460, 800))
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

  let yaw = options
    .yaw
    .map(|yaw| narrow(yaw).ok_or(crate::error::Error::InvalidYaw))
    .transpose()?;

  let model = renderer.load_skin(
    skin,
    model_kind,
    model_outer_layer,
    &armor,
    options.glint.as_deref(),
    options.cape.as_deref(),
    options.pose.unwrap_or_default(),
  )?;
  let png = renderer.render(&model, yaw).await?;

  Ok(png.into())
}

// Checked after narrowing, since a huge f64 becomes an f32 infinity
fn narrow(value: f64) -> Option<f32> {
  let value = value as f32;
  value.is_finite().then_some(value)
}
