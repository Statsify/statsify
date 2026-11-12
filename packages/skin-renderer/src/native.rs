use async_once::AsyncOnce;
use lazy_static::lazy_static;
use napi::bindgen_prelude::*;
use napi_derive::napi;

use crate::armor::Armor;
use crate::model::{ModelKind, ModelOuterLayer};
use crate::renderer::native::NativeBackend;
use crate::renderer::SkinRenderer;

lazy_static! {
  static ref SKIN_RENDERER: AsyncOnce<SkinRenderer<NativeBackend>> = AsyncOnce::new(async {
    SkinRenderer::new(460, 800)
      .await
      .expect("skin renderer initialized")
  });
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
}

#[napi]
pub async fn render_skin(
  skin: &[u8],
  slim: bool,
  extruded: bool,
  options: Option<RenderOptions>,
) -> Result<Buffer> {
  let renderer = SKIN_RENDERER.get().await;

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
  )?;
  let buffer = renderer.render(&model, yaw).await?;

  Ok(buffer.into())
}
