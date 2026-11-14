#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error(transparent)]
  Io(#[from] std::io::Error),

  #[error("The provided image is not a valid skin texture")]
  InvalidSkinTexture,

  #[error("The provided image is too large for a cape texture")]
  CapeTooLarge,

  #[cfg(not(target_arch = "wasm32"))]
  #[error("The camera yaw must be a finite number")]
  InvalidYaw,

  #[error("Enchanted armor needs a glint texture")]
  MissingGlint,

  #[error(transparent)]
  Image(#[from] image::ImageError),

  #[error(transparent)]
  Render(#[from] statsify_render_core::Error),

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
