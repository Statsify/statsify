#[cfg(not(target_arch = "wasm32"))]
use napi::bindgen_prelude::Uint8Array;
#[cfg(not(target_arch = "wasm32"))]
use napi_derive::napi;

use crate::model::Part;

#[cfg(not(target_arch = "wasm32"))]
type Bytes = Uint8Array;
#[cfg(target_arch = "wasm32")]
type Bytes = Vec<u8>;

#[cfg_attr(not(target_arch = "wasm32"), napi(object))]
pub struct ArmorPiece {
  /// Texture (PNG) in the armour layout: `layer_1` for helmets, chestplates and boots,
  /// `layer_2` for leggings.
  #[cfg_attr(not(target_arch = "wasm32"), napi(ts_type = "Uint8Array"))]
  pub texture: Bytes,
  pub enchanted: bool,
  /// Draws the helmet's texture, a skin or mob texture, as a worn skull or player head
  /// instead of an armour layer.
  pub skull: Option<bool>,
}

impl ArmorPiece {
  pub fn is_skull(&self) -> bool {
    self.skull.unwrap_or(false)
  }
}

#[cfg_attr(not(target_arch = "wasm32"), napi(object))]
#[derive(Default)]
pub struct Armor {
  pub helmet: Option<ArmorPiece>,
  pub chestplate: Option<ArmorPiece>,
  pub leggings: Option<ArmorPiece>,
  pub boots: Option<ArmorPiece>,
}

#[derive(Clone, Copy)]
pub enum ArmorLayer {
  Outer,
  Inner,
}

impl ArmorLayer {
  pub fn inflation(self) -> f32 {
    match self {
      ArmorLayer::Outer => 1.0,
      // The game's leggings sit 0.5 out, where the flat outer layer reaches on
      // the body's sides, so they move just past it
      ArmorLayer::Inner => 0.55,
    }
  }
}

impl Armor {
  // An extruded outer layer would poke through leggings or a worn skull, so parts under
  // them get the flat one, which the game draws under armour anyway
  pub fn flattens(&self, part: Part) -> bool {
    self.pieces().any(|(piece, layer, parts)| {
      (matches!(layer, ArmorLayer::Inner) || piece.is_skull()) && parts.contains(&part)
    })
  }

  pub fn pieces(&self) -> impl Iterator<Item = (&ArmorPiece, ArmorLayer, &'static [Part])> {
    [
      (&self.helmet, ArmorLayer::Outer, &[Part::Head][..]),
      (
        &self.chestplate,
        ArmorLayer::Outer,
        &[Part::Body, Part::RightArm, Part::LeftArm],
      ),
      (
        &self.leggings,
        ArmorLayer::Inner,
        &[Part::Body, Part::RightLeg, Part::LeftLeg],
      ),
      (
        &self.boots,
        ArmorLayer::Outer,
        &[Part::RightLeg, Part::LeftLeg],
      ),
    ]
    .into_iter()
    .filter_map(|(piece, layer, parts)| piece.as_ref().map(|piece| (piece, layer, parts)))
  }
}
