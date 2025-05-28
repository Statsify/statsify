#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error(transparent)]
  Io(#[from] std::io::Error),

  #[error("The provided image is not a valid skin texture")]
  InvalidSkinTexture,

  #[error(transparent)]
  Image(#[from] image::ImageError),

  #[error("Failed to render skin")]
  RenderFailure,

  #[error(transparent)]
  RequestDevice(#[from] wgpu::RequestDeviceError),

  #[error(transparent)]
  Poll(#[from] wgpu::PollError),

  #[error("Instance did not provide any adapters")]
  MissingAdapter,

  #[error(transparent)]
  CreateSurface(#[from] wgpu::CreateSurfaceError),

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
