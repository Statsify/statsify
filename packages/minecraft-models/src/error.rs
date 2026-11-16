#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("The pack has no model named {0}")]
  MissingModel(String),

  #[error("The pack has no texture named {0}")]
  MissingTexture(String),

  #[error("The texture {0} is too large")]
  TextureTooLarge(String),

  #[error("The model {name} is invalid: {reason}")]
  InvalidModel { name: String, reason: String },

  #[error("The animation of {name} is invalid: {reason}")]
  InvalidAnimation { name: String, reason: String },

  #[error(transparent)]
  Image(#[from] image::ImageError),
}
