use async_once::AsyncOnce;
use lazy_static::lazy_static;
use napi::bindgen_prelude::*;
use napi_derive::napi;

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

#[napi]
pub async fn render_skin(skin: &[u8], slim: bool, extruded: bool) -> Result<Buffer> {
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

  let model = renderer.load_skin(skin, model_kind, model_outer_layer)?;
  let buffer = renderer.render(&model).await?;

  Ok(buffer.into())
}
