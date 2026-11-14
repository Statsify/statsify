//! Bakes Minecraft 1.8 JSON models and their textures into meshes for a GPU.
//!
//! Positions are in blocks (16 model units) in Minecraft's right-handed axes, x east, y up and z
//! south, with the model's 0 to 16 block centered on the origin, as 1.8's item renderer centers it
//! before applying a [`Transform`]. Triangles wind counter-clockwise seen from their front. Texture
//! coordinates run 0 to 1 across the whole texture (one frame of a strip), v pointing down.

mod bake;
mod display;
mod error;
mod json;
mod model;
mod texture;

use std::collections::HashMap;

pub use bake::{bake_model, BakedModel, Submesh, Vertex};
pub use display::{Display, Transform};
pub use error::Error;
pub use texture::{load_texture, Texture, ALPHA_CUTOFF};

/// The parts of a resource pack a caller has read, keyed by path under `assets/minecraft/models` or
/// `assets/minecraft/textures` without the extension (`block/furnace`, `blocks/stone`). A texture's
/// `.mcmeta` goes under the texture's name.
#[derive(Clone, Debug, Default)]
pub struct Pack {
  pub models: HashMap<String, String>,
  pub textures: HashMap<String, Vec<u8>>,
  pub mcmeta: HashMap<String, String>,
}
