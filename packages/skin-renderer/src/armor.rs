use image::{imageops, DynamicImage};
#[cfg(not(target_arch = "wasm32"))]
use napi_derive::napi;

use crate::model::{ModelOuterLayer, Part};

macro_rules! texture {
  ($name:literal) => {
    include_bytes!(concat!("../textures/", $name, ".png"))
  };
}

pub const GLINT_TEXTURE: &[u8] = texture!("enchanted_item_glint");

const DEFAULT_LEATHER_COLOR: u32 = 0xa06540;

// napi types string enums as a const enum, which callers compiled with
// isolatedModules can't use, so `material` is typed as a union instead
#[cfg_attr(
  not(target_arch = "wasm32"),
  napi(string_enum = "lowercase", skip_typescript)
)]
#[derive(Clone, Copy)]
pub enum ArmorMaterial {
  Leather,
  Chainmail,
  Iron,
  Gold,
  Diamond,
}

#[cfg_attr(not(target_arch = "wasm32"), napi(object))]
pub struct ArmorPiece {
  #[cfg_attr(
    not(target_arch = "wasm32"),
    napi(ts_type = "'leather' | 'chainmail' | 'iron' | 'gold' | 'diamond'")
  )]
  pub material: ArmorMaterial,
  /// Dye as `0xRRGGBB`, leather only. Undyed leather is brown.
  pub color: Option<u32>,
  pub enchanted: Option<bool>,
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
  pub fn inflation(self, outer_layer: ModelOuterLayer) -> f32 {
    match (self, outer_layer) {
      (ArmorLayer::Outer, _) => 1.0,
      // The game's leggings sit 0.5 out, but this renderer's outer skin layer
      // reaches that far (0.75 extruded), so they move just past it
      (ArmorLayer::Inner, ModelOuterLayer::D2) => 0.55,
      (ArmorLayer::Inner, ModelOuterLayer::D3) => 0.8,
    }
  }
}

impl Armor {
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

impl ArmorPiece {
  pub fn texture(&self, layer: ArmorLayer) -> DynamicImage {
    let texture = load_texture(match (self.material, layer) {
      (ArmorMaterial::Leather, ArmorLayer::Outer) => texture!("leather_layer_1"),
      (ArmorMaterial::Leather, ArmorLayer::Inner) => texture!("leather_layer_2"),
      (ArmorMaterial::Chainmail, ArmorLayer::Outer) => texture!("chainmail_layer_1"),
      (ArmorMaterial::Chainmail, ArmorLayer::Inner) => texture!("chainmail_layer_2"),
      (ArmorMaterial::Iron, ArmorLayer::Outer) => texture!("iron_layer_1"),
      (ArmorMaterial::Iron, ArmorLayer::Inner) => texture!("iron_layer_2"),
      (ArmorMaterial::Gold, ArmorLayer::Outer) => texture!("gold_layer_1"),
      (ArmorMaterial::Gold, ArmorLayer::Inner) => texture!("gold_layer_2"),
      (ArmorMaterial::Diamond, ArmorLayer::Outer) => texture!("diamond_layer_1"),
      (ArmorMaterial::Diamond, ArmorLayer::Inner) => texture!("diamond_layer_2"),
    });

    let ArmorMaterial::Leather = self.material else {
      return texture;
    };

    let mut texture = texture.into_rgba8();
    let dye = self.color.unwrap_or(DEFAULT_LEATHER_COLOR).to_be_bytes();

    for pixel in texture.pixels_mut() {
      for channel in 0..3 {
        pixel[channel] = (pixel[channel] as u32 * dye[channel + 1] as u32 / 255) as u8;
      }
    }

    // The overlay keeps its own colours
    let overlay = load_texture(match layer {
      ArmorLayer::Outer => texture!("leather_layer_1_overlay"),
      ArmorLayer::Inner => texture!("leather_layer_2_overlay"),
    });

    imageops::overlay(&mut texture, &overlay, 0, 0);

    texture.into()
  }
}

pub fn load_texture(bytes: &[u8]) -> DynamicImage {
  image::load_from_memory(bytes).expect("bundled textures are valid images")
}
