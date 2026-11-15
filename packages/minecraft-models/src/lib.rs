//! Bakes Minecraft 1.8 JSON models and their textures into meshes for a GPU.
//!
//! Positions are in blocks (16 model units) in Minecraft's right-handed axes, x east, y up and z
//! south, with the model's 0 to 16 block centered on the origin, as 1.8's item renderer centers it
//! before applying a [`Transform`]. Triangles wind counter-clockwise seen from their front. Texture
//! coordinates run 0 to 1 across the whole texture (one frame of a strip), v pointing down.

mod bake;
mod display;
mod error;
mod model;
mod texture;

use std::collections::HashMap;

use serde_json::Value;

pub use bake::{bake_model, BakedModel, Submesh, Vertex};
pub use display::{Display, Transform};
pub use error::Error;
pub use texture::{load_texture, Frame, Texture, ALPHA_CUTOFF};

/// The parts of a resource pack a caller has read, keyed by path under `assets/minecraft/models` or
/// `assets/minecraft/textures` without the extension (`block/furnace`, `blocks/stone`). A texture's
/// `.mcmeta` goes under the texture's name.
#[derive(Clone, Debug, Default)]
pub struct Pack {
  pub models: HashMap<String, String>,
  pub textures: HashMap<String, Vec<u8>>,
  pub mcmeta: HashMap<String, String>,
}

/// Parses a model or `.mcmeta` file, which 1.8 requires to be an object.
fn parse_json(text: &str) -> Result<Value, String> {
  let value: Value =
    serde_json::from_str(&strip_stray_commas(text)).map_err(|error| error.to_string())?;

  if !value.is_object() {
    return Err("the file is not a JSON object".to_string());
  }

  Ok(value)
}

/// 1.8 reads empty array slots (`[,1]`, `[1,,2]`, `[1,]`) as null and skips them in `.mcmeta` frame lists.
/// Packs rely on these stray commas and on trailing commas in objects.
fn strip_stray_commas(text: &str) -> String {
  const WHITESPACE: [char; 4] = [' ', '\t', '\n', '\r'];

  let mut out = String::with_capacity(text.len());
  let mut in_string = false;
  let mut escaped = false;

  for (at, c) in text.char_indices() {
    if in_string {
      match c {
        _ if escaped => escaped = false,
        '\\' => escaped = true,
        '"' => in_string = false,
        _ => {}
      }
    } else if c == '"' {
      in_string = true;
    } else if c == ','
      && (out.trim_end_matches(WHITESPACE).ends_with('[')
        || text[at + 1..]
          .trim_start_matches(WHITESPACE)
          .starts_with([',', ']', '}']))
    {
      continue;
    }

    out.push(c);
  }

  out
}

#[cfg(test)]
mod tests {
  use serde_json::json;

  use super::*;

  #[test]
  fn drops_stray_commas_outside_strings() {
    let text = r#"{ "frames": [0,, 1,,, 2,
      ], "lead": [,0], "leads": [ ,, 1], "name": "a,,]\",}\\", "b": { "c": [], }, }"#;

    assert_eq!(
      parse_json(text),
      Ok(json!({
        "frames": [0, 1, 2],
        "lead": [0],
        "leads": [1],
        "name": "a,,]\",}\\",
        "b": { "c": [] }
      }))
    );

    for invalid in [r#"{ "a": 1 } 2"#, r#"{ , "a": 1 }"#, "[1, 2,]"] {
      assert!(parse_json(invalid).is_err(), "{invalid} should not parse");
    }
  }
}
