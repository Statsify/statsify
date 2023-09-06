use image::{DynamicImage, GenericImage, GenericImageView, ImageResult, Rgba};
use reqwest::Client;

use crate::error::{SkinRendererError, SkinRendererResult};

pub struct SkinLoader {
  client: Client,
}

#[derive(Debug)]
enum SkinFormat {
  /// Legacy skin format (64x32)
  Legacy = 32,
  /// Modern skin format (64x64)
  Modern = 64,
}

trait SkinSize {
  fn width(&self) -> u32;
  fn height(&self) -> u32;
}

impl SkinSize for SkinFormat {
  fn height(&self) -> u32 {
    match self {
      SkinFormat::Legacy => 32,
      SkinFormat::Modern => 64,
    }
  }

  fn width(&self) -> u32 {
    match self {
      SkinFormat::Legacy => 64,
      SkinFormat::Modern => 64,
    }
  }
}

impl SkinLoader {
  pub fn new() -> Self {
    Self {
      client: Client::new(),
    }
  }

  pub async fn get_skin(&self, url: &str) -> SkinRendererResult<DynamicImage> {
    let response = self.client.get(url).send().await?;

    if response.status().is_success() {
      let bytes = response.bytes().await?;
      let image = image::load_from_memory_with_format(&bytes, image::ImageFormat::Png)?;
      let skin = Self::process_skin(image)?;

      Ok(skin)
    } else {
      Err(SkinRendererError::MissingSkinTexture)
    }
  }

  fn process_skin(skin: DynamicImage) -> ImageResult<DynamicImage> {
    let format = Self::skin_format(&skin);

    let mut skin = match format {
      SkinFormat::Legacy => Self::convert_legacy_skin(skin)?,
      SkinFormat::Modern => skin,
    };

    Self::fix_opaque_skin(&mut skin, format);

    Ok(skin)
  }

  fn skin_format(skin: &DynamicImage) -> SkinFormat {
    if skin.height() == SkinFormat::Legacy.height() {
      SkinFormat::Legacy
    } else {
      SkinFormat::Modern
    }
  }

  /// Legacy skins are 64x32 and are missing separate textures for the left leg and arm.
  /// Legacy skins also do not have any 2nd layer textures.
  fn convert_legacy_skin(legacy_skin: DynamicImage) -> ImageResult<DynamicImage> {
    let modern = SkinFormat::Modern;
    let mut skin = DynamicImage::new_rgba8(modern.width(), modern.height());

    skin.copy_from(&legacy_skin, 0, 0)?;

    // Copy right leg to left leg position
    skin.copy_from(&legacy_skin.crop_imm(0, 16, 16, 16), 16, 48)?;

    // Copy right arm to left arm position
    skin.copy_from(&legacy_skin.crop_imm(40, 16, 16, 16), 32, 48)?;

    Ok(skin)
  }

  // See https://github.com/bs-community/skinview3d/issues/93
  /// Fixes skins with opaque backgrounds by making the background transparent.
  fn fix_opaque_skin(skin: &mut DynamicImage, original_format: SkinFormat) {
    // if the skin has any transparent pixels then it's not an opaque skin
    let width = original_format.width();
    let height = original_format.height();

    for x in 0..width {
      for y in 0..height {
        let pixel = skin.get_pixel(x, y);

        if pixel[3] == 0 {
          return;
        }
      }
    }

    let transparent = Rgba([0, 0, 0, 0]);

    fill_rect(skin, 40, 0, 8, 8, transparent); // Helm Top
    fill_rect(skin, 48, 0, 8, 8, transparent); // Helm Bottom
    fill_rect(skin, 32, 8, 8, 8, transparent); // Helm Right
    fill_rect(skin, 40, 8, 8, 8, transparent); // Helm Front
    fill_rect(skin, 48, 8, 8, 8, transparent); // Helm Left
    fill_rect(skin, 56, 8, 8, 8, transparent); // Helm Back

    if matches!(original_format, SkinFormat::Modern) {
      fill_rect(skin, 4, 32, 4, 4, transparent); // Right Leg Layer 2 Top
      fill_rect(skin, 8, 32, 4, 4, transparent); // Right Leg Layer 2 Bottom
      fill_rect(skin, 0, 36, 4, 12, transparent); // Right Leg Layer 2 Right
      fill_rect(skin, 4, 36, 4, 12, transparent); // Right Leg Layer 2 Front
      fill_rect(skin, 8, 36, 4, 12, transparent); // Right Leg Layer 2 Left
      fill_rect(skin, 12, 36, 4, 12, transparent); // Right Leg Layer 2 Back
      fill_rect(skin, 20, 32, 8, 4, transparent); // Torso Layer 2 Top
      fill_rect(skin, 28, 32, 8, 4, transparent); // Torso Layer 2 Bottom
      fill_rect(skin, 16, 36, 4, 12, transparent); // Torso Layer 2 Right
      fill_rect(skin, 20, 36, 8, 12, transparent); // Torso Layer 2 Front
      fill_rect(skin, 28, 36, 4, 12, transparent); // Torso Layer 2 Left
      fill_rect(skin, 32, 36, 8, 12, transparent); // Torso Layer 2 Back
      fill_rect(skin, 44, 32, 4, 4, transparent); // Right Arm Layer 2 Top
      fill_rect(skin, 48, 32, 4, 4, transparent); // Right Arm Layer 2 Bottom
      fill_rect(skin, 40, 36, 4, 12, transparent); // Right Arm Layer 2 Right
      fill_rect(skin, 44, 36, 4, 12, transparent); // Right Arm Layer 2 Front
      fill_rect(skin, 48, 36, 4, 12, transparent); // Right Arm Layer 2 Left
      fill_rect(skin, 52, 36, 12, 12, transparent); // Right Arm Layer 2 Back
      fill_rect(skin, 4, 48, 4, 4, transparent); // Left Leg Layer 2 Top
      fill_rect(skin, 8, 48, 4, 4, transparent); // Left Leg Layer 2 Bottom
      fill_rect(skin, 0, 52, 4, 12, transparent); // Left Leg Layer 2 Right
      fill_rect(skin, 4, 52, 4, 12, transparent); // Left Leg Layer 2 Front
      fill_rect(skin, 8, 52, 4, 12, transparent); // Left Leg Layer 2 Left
      fill_rect(skin, 12, 52, 4, 12, transparent); // Left Leg Layer 2 Back
      fill_rect(skin, 52, 48, 4, 4, transparent); // Left Arm Layer 2 Top
      fill_rect(skin, 56, 48, 4, 4, transparent); // Left Arm Layer 2 Bottom
      fill_rect(skin, 48, 52, 4, 12, transparent); // Left Arm Layer 2 Right
      fill_rect(skin, 52, 52, 4, 12, transparent); // Left Arm Layer 2 Front
      fill_rect(skin, 56, 52, 4, 12, transparent); // Left Arm Layer 2 Left
      fill_rect(skin, 60, 52, 4, 12, transparent); // Left Arm Layer 2 Back
    }
  }
}

fn fill_rect(image: &mut DynamicImage, x: u32, y: u32, width: u32, height: u32, pixel: Rgba<u8>) {
  for x in x..x + width {
    for y in y..y + height {
      image.put_pixel(x, y, pixel);
    }
  }
}
