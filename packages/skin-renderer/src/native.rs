use async_once::AsyncOnce;
use lazy_static::lazy_static;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use tokio::sync::Mutex;

use crate::model::{ModelKind, ModelOuterLayer};
use crate::renderer::native::NativeBackend;
use crate::renderer::SkinRenderer;

lazy_static! {
  static ref SKIN_RENDERER: AsyncOnce<SkinRenderer<NativeBackend>> = AsyncOnce::new(async {
    SkinRenderer::new(460, 800)
      .await
      .expect("skin renderer initialized")
  });
  // Serialises renders that mutate the shared GPU camera buffer.
  static ref RENDER_YAW_LOCK: Mutex<()> = Mutex::new(());
}

#[napi]
pub async fn render_skin(
  skin: &[u8],
  slim: bool,
  extruded: bool,
  yaw: Option<f64>,
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

  let model = renderer.load_skin(skin, model_kind, model_outer_layer)?;

  let buffer = match yaw {
    Some(y) => {
      let _guard = RENDER_YAW_LOCK.lock().await;
      renderer.render_at_yaw(&model, y as f32).await?
    }
    None => renderer.render(&model).await?,
  };

  Ok(buffer.into())
}
