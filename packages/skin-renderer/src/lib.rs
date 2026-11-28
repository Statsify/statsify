#![deny(clippy::disallowed_methods)]

mod armor;
#[cfg(not(target_arch = "wasm32"))]
mod attachment;
mod error;
mod geometry;
mod model;
#[cfg(not(target_arch = "wasm32"))]
mod mount;
#[cfg(not(target_arch = "wasm32"))]
mod native;
mod pose;
#[cfg(not(target_arch = "wasm32"))]
mod scene;
mod skin_loader;
#[cfg(target_arch = "wasm32")]
mod wasm;
#[cfg(not(target_arch = "wasm32"))]
pub use error::*;
#[cfg(not(target_arch = "wasm32"))]
pub use native::render_skin;
