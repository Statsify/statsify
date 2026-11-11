use image::{imageops, DynamicImage};
#[cfg(not(target_arch = "wasm32"))]
use napi::bindgen_prelude::Uint8Array;
#[cfg(not(target_arch = "wasm32"))]
use napi_derive::napi;

use crate::error::{Error, Result};
use crate::model::Part;

#[cfg(not(target_arch = "wasm32"))]
type Bytes = Uint8Array;
#[cfg(target_arch = "wasm32")]
type Bytes = Vec<u8>;

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

#[cfg_attr(
  not(target_arch = "wasm32"),
  napi(string_enum = "snake_case", skip_typescript)
)]
#[derive(Clone, Copy)]
pub enum Skull {
  Skeleton,
  WitherSkeleton,
  Zombie,
  Creeper,
}

#[cfg_attr(not(target_arch = "wasm32"), napi(object))]
#[derive(Clone, Copy)]
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
pub struct Helmet {
  #[cfg_attr(
    not(target_arch = "wasm32"),
    napi(ts_type = "'leather' | 'chainmail' | 'iron' | 'gold' | 'diamond'")
  )]
  pub material: Option<ArmorMaterial>,
  /// Skin texture (PNG) whose head is worn as a player head, in place of a material.
  #[cfg_attr(not(target_arch = "wasm32"), napi(ts_type = "Uint8Array"))]
  pub head: Option<Bytes>,
  /// Vanilla mob skull worn in place of a material.
  #[cfg_attr(
    not(target_arch = "wasm32"),
    napi(ts_type = "'skeleton' | 'wither_skeleton' | 'zombie' | 'creeper'")
  )]
  pub skull: Option<Skull>,
  /// Dye as `0xRRGGBB`, leather only. Undyed leather is brown.
  pub color: Option<u32>,
  pub enchanted: Option<bool>,
}

#[cfg_attr(not(target_arch = "wasm32"), napi(object))]
#[derive(Default)]
pub struct Armor {
  pub helmet: Option<Helmet>,
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
  // An extruded outer layer would poke through the leggings and reach a worn head's
  // surface, so parts under them get the flat one, which the game draws under armour anyway
  pub fn flattens(&self, part: Part) -> bool {
    let wears_head = self
      .helmet
      .as_ref()
      .is_some_and(|helmet| helmet.material.is_none());

    (part == Part::Head && wears_head)
      || self
        .pieces()
        .any(|(_, layer, parts)| matches!(layer, ArmorLayer::Inner) && parts.contains(&part))
  }

  pub fn head(&self) -> Result<Option<&[u8]>> {
    let Some(helmet) = &self.helmet else {
      return Ok(None);
    };

    match (helmet.material, &helmet.head, helmet.skull) {
      (Some(_), None, None) => Ok(None),
      (None, Some(head), None) => Ok(Some(&head[..])),
      (None, None, Some(skull)) => Ok(Some(skull.texture())),
      _ => Err(Error::InvalidHelmet),
    }
  }

  pub fn pieces(&self) -> impl Iterator<Item = (ArmorPiece, ArmorLayer, &'static [Part])> {
    let helmet = self.helmet.as_ref().and_then(|helmet| {
      helmet.material.map(|material| ArmorPiece {
        material,
        color: helmet.color,
        enchanted: helmet.enchanted,
      })
    });

    [
      (helmet, ArmorLayer::Outer, &[Part::Head][..]),
      (
        self.chestplate,
        ArmorLayer::Outer,
        &[Part::Body, Part::RightArm, Part::LeftArm],
      ),
      (
        self.leggings,
        ArmorLayer::Inner,
        &[Part::Body, Part::RightLeg, Part::LeftLeg],
      ),
      (
        self.boots,
        ArmorLayer::Outer,
        &[Part::RightLeg, Part::LeftLeg],
      ),
    ]
    .into_iter()
    .filter_map(|(piece, layer, parts)| piece.map(|piece| (piece, layer, parts)))
  }
}

impl Skull {
  fn texture(self) -> &'static [u8] {
    match self {
      Skull::Skeleton => texture!("skeleton"),
      Skull::WitherSkeleton => texture!("wither_skeleton"),
      Skull::Zombie => texture!("zombie"),
      Skull::Creeper => texture!("creeper"),
    }
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
