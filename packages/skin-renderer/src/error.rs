#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("The provided image is not a valid skin texture")]
  InvalidSkinTexture,

  #[error("The provided image is too large for a cape texture")]
  CapeTooLarge,

  #[cfg(not(target_arch = "wasm32"))]
  #[error("The camera yaw must be a finite number")]
  InvalidYaw,

  #[cfg(not(target_arch = "wasm32"))]
  #[error("The camera pitch must be a finite number")]
  InvalidPitch,

  #[cfg(not(target_arch = "wasm32"))]
  #[error("A model on a player bone needs a player")]
  MissingPlayer,

  #[cfg(not(target_arch = "wasm32"))]
  #[error("The scene has nothing to frame")]
  EmptyScene,

  #[cfg(not(target_arch = "wasm32"))]
  #[error("The translation, rotation or scale of {0} is not finite, or scales it too small or too large to render")]
  InvalidTransform(String),

  #[cfg(not(target_arch = "wasm32"))]
  #[error("The scene is too small or too large to frame")]
  SceneOutOfRange,

  #[error("The provided image is empty")]
  EmptyTexture,

  #[error("Enchanted armor needs a glint texture")]
  MissingGlint,

  #[cfg(not(target_arch = "wasm32"))]
  #[error("A mount needs a texture")]
  MissingMountTexture,

  #[error(transparent)]
  Image(#[from] image::ImageError),

  #[error(transparent)]
  Render(#[from] statsify_render_core::Error),

  #[cfg(not(target_arch = "wasm32"))]
  #[error(transparent)]
  Model(#[from] statsify_minecraft_models::Error),

  #[cfg(target_arch = "wasm32")]
  #[error("Failed to access canvas")]
  CanvasNotFound,

  #[cfg(target_arch = "wasm32")]
  #[error("Failed to create window")]
  WindowCreationFailed(#[from] winit::error::OsError),
}

pub type Result<T> = std::result::Result<T, Error>;

#[cfg(not(target_arch = "wasm32"))]
impl From<Error> for napi::Error {
  fn from(value: Error) -> Self {
    Self::new(
      napi::Status::GenericFailure,
      format!("SkinRendererError: {value}"),
    )
  }
}
