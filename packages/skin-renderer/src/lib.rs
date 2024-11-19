mod buffer_dimensions;
mod camera;
mod error;
mod instance;
mod light;
mod model;
mod renderer;
mod resources;
mod skin_loader;
mod texture;

use async_once::AsyncOnce;
use lazy_static::lazy_static;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use renderer::{SkinModelType, SkinRenderer};

lazy_static! {
  static ref SKIN_RENDERER: AsyncOnce<SkinRenderer> = AsyncOnce::new(async {
    SkinRenderer::new(460, 800)
      .await
      .expect("Failed to initialize skin renderer")
  });
}

#[napi]
pub async fn render_skin(skin_textures: Option<Buffer>, is_slim: bool) -> Result<Buffer> {
  let renderer = SKIN_RENDERER.get().await;

  let model_type = if is_slim {
    SkinModelType::Slim
  } else {
    SkinModelType::Classic
  };

  let skin_render = if let Some(skin_textures) = skin_textures {
    renderer.render(skin_textures.into(), model_type).await?
  } else {
    renderer.render_default_texture(model_type).await?
  };

  Ok(skin_render.into())
}
