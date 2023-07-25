#[derive(Debug, thiserror::Error)]
pub enum SkinRendererError {
  #[error(transparent)]
  Io(#[from] std::io::Error),

  #[error(transparent)]
  ObjLoad(#[from] tobj::LoadError),

  #[error("A material is missing a diffuse texture")]
  MissingDiffuseTexture,

  #[error("The provided url is not a valid skin texture")]
  MissingSkinTexture,

  #[error("Request error: {status_code} {url} {message}")]
  RequestError {
    status_code: u16,
    url: String,
    message: String,
    #[source]
    source: reqwest::Error,
  },

  #[error(transparent)]
  Image(#[from] image::ImageError),

  #[error("Failed to render skin")]
  RenderFailure,
}

impl From<reqwest::Error> for SkinRendererError {
  fn from(error: reqwest::Error) -> Self {
    let status_code = error.status().map(|s| s.as_u16()).unwrap_or(0);
    let url = error.url().map(|u| u.to_string()).unwrap_or_default();
    let message = error.to_string();

    Self::RequestError {
      status_code,
      url,
      message,
      source: error,
    }
  }
}

impl From<SkinRendererError> for napi::Error {
  fn from(value: SkinRendererError) -> Self {
    napi::Error::new(
      napi::Status::GenericFailure,
      format!("SkinRendererError: {}", value),
    )
  }
}

pub type SkinRendererResult<T> = std::result::Result<T, SkinRendererError>;
