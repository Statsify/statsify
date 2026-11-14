#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("The provided image is too large for a texture")]
  TextureTooLarge,

  #[error(transparent)]
  Image(#[from] image::ImageError),

  #[error("Failed to render skin")]
  RenderFailure,

  #[error("The output must be between 1 and {0} pixels wide and high")]
  OutputSize(u32),

  #[error(transparent)]
  RequestDevice(#[from] wgpu::RequestDeviceError),

  #[error(transparent)]
  Poll(#[from] wgpu::PollError),

  #[error("Instance did not provide any adapters")]
  MissingAdapter,

  #[error(transparent)]
  CreateSurface(#[from] wgpu::CreateSurfaceError),
}

pub type Result<T> = std::result::Result<T, Error>;
