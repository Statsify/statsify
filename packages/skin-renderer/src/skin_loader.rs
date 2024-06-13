use image::math::Rect;
use image::{DynamicImage, GenericImage, GenericImageView, ImageResult, Rgba};

use crate::error::{Error, Result};

#[derive(Debug, Clone, Copy)]
enum SkinFormat {
  /// Legacy skin format (64x32)
  Legacy = 32,
  /// Modern skin format (64x64)
  Modern = 64,
}

impl SkinFormat {
  fn try_from_image(image: &DynamicImage) -> Option<Self> {
    match image.height() {
      32 => Some(Self::Legacy),
      64 => Some(Self::Modern),
      _ => None,
    }
  }

  fn width(&self) -> u32 {
    64
  }

  fn height(&self) -> u32 {
    *self as u32
  }
}

pub fn load_skin_from_memory(skin: &[u8]) -> Result<DynamicImage> {
  let skin = image::load_from_memory(skin)?;
  let skin = process_skin(skin)?;

  Ok(skin)
}

fn process_skin(skin: DynamicImage) -> Result<DynamicImage> {
  let format = SkinFormat::try_from_image(&skin).ok_or(Error::InvalidSkinTexture)?;

  let mut skin = match format {
    SkinFormat::Legacy => convert_legacy_skin(skin)?,
    SkinFormat::Modern => skin,
  };

  // Fix skins with opaque backgrounds and transparent skins
  // This is marked as unsafe since it doesn't perform any bounds checking when
  // accessing pixels This is safe to do since the skin is guaranteed to be
  // 64x64 or 64x32
  unsafe {
    fix_opaque_skin(&mut skin, format);
    fix_transparent_skin(&mut skin);
  }

  Ok(skin)
}

macro_rules! rect {
  ($x:expr, $y:expr, $width:expr, $height:expr) => {
    Rect {
      x: $x,
      y: $y,
      width: $width,
      height: $height,
    }
  };
}

/// Legacy skins are 64x32 and are missing separate textures for the left leg
/// and arm. Legacy skins also do not have any 2nd layer textures.
fn convert_legacy_skin(legacy_skin: DynamicImage) -> ImageResult<DynamicImage> {
  let format = SkinFormat::Modern;
  let mut skin = DynamicImage::new_rgba8(format.width(), format.height());

  skin.copy_from(&legacy_skin, 0, 0)?;

  // Copy right leg to left leg position
  skin.copy_within(rect!(0, 16, 16, 16), 16, 48);

  // Copy right arm to left arm position
  skin.copy_within(rect!(40, 16, 16, 16), 32, 48);

  Ok(skin)
}

// See https://github.com/bs-community/skinview3d/issues/93
/// Fixes skins with opaque backgrounds by making the background transparent.
unsafe fn fix_opaque_skin(skin: &mut DynamicImage, original_format: SkinFormat) {
  // if the skin has any transparent pixels then it's not an opaque skin
  let width = original_format.width();
  let height = original_format.height();

  for x in 0..width {
    for y in 0..height {
      let pixel = skin.unsafe_get_pixel(x, y);
      let opacity = pixel[3];

      if opacity == 0 {
        return;
      }
    }
  }

  let transparent = Rgba([0, 0, 0, 0]);

  const REQUIRED_REGIONS: [Rect; 6] = [
    rect!(40, 0, 8, 8), // Helm Top
    rect!(48, 0, 8, 8), // Helm Bottom
    rect!(32, 8, 8, 8), // Helm Right
    rect!(40, 8, 8, 8), // Helm Front
    rect!(48, 8, 8, 8), // Helm Left
    rect!(56, 8, 8, 8), // Helm Back
  ];

  const REQUIRED_REGIONS_MODERN: [Rect; 30] = [
    rect!(4, 32, 4, 4),    // Right Leg Layer 2 Top
    rect!(8, 32, 4, 4),    // Right Leg Layer 2 Bottom
    rect!(0, 36, 4, 12),   // Right Leg Layer 2 Right
    rect!(4, 36, 4, 12),   // Right Leg Layer 2 Front
    rect!(8, 36, 4, 12),   // Right Leg Layer 2 Left
    rect!(12, 36, 4, 12),  // Right Leg Layer 2 Back
    rect!(20, 32, 8, 4),   // Torso Layer 2 Top
    rect!(28, 32, 8, 4),   // Torso Layer 2 Bottom
    rect!(16, 36, 4, 12),  // Torso Layer 2 Right
    rect!(20, 36, 8, 12),  // Torso Layer 2 Front
    rect!(28, 36, 4, 12),  // Torso Layer 2 Left
    rect!(32, 36, 8, 12),  // Torso Layer 2 Back
    rect!(44, 32, 4, 4),   // Right Arm Layer 2 Top
    rect!(48, 32, 4, 4),   // Right Arm Layer 2 Bottom
    rect!(40, 36, 4, 12),  // Right Arm Layer 2 Right
    rect!(44, 36, 4, 12),  // Right Arm Layer 2 Front
    rect!(48, 36, 4, 12),  // Right Arm Layer 2 Left
    rect!(52, 36, 12, 12), // Right Arm Layer 2 Back
    rect!(4, 48, 4, 4),    // Left Leg Layer 2 Top
    rect!(8, 48, 4, 4),    // Left Leg Layer 2 Bottom
    rect!(0, 52, 4, 12),   // Left Leg Layer 2 Right
    rect!(4, 52, 4, 12),   // Left Leg Layer 2 Front
    rect!(8, 52, 4, 12),   // Left Leg Layer 2 Left
    rect!(12, 52, 4, 12),  // Left Leg Layer 2 Back
    rect!(52, 48, 4, 4),   // Left Arm Layer 2 Top
    rect!(56, 48, 4, 4),   // Left Arm Layer 2 Bottom
    rect!(48, 52, 4, 12),  // Left Arm Layer 2 Right
    rect!(52, 52, 4, 12),  // Left Arm Layer 2 Front
    rect!(56, 52, 4, 12),  // Left Arm Layer 2 Left
    rect!(60, 52, 4, 12),  // Left Arm Layer 2 Back
  ];

  for &region in &REQUIRED_REGIONS {
    unsafe_fill_rect(skin, region, transparent);
  }

  if matches!(original_format, SkinFormat::Modern) {
    for &region in &REQUIRED_REGIONS_MODERN {
      unsafe_fill_rect(skin, region, transparent);
    }
  }
}

unsafe fn fix_transparent_skin(skin: &mut DynamicImage) {
  unsafe_remove_transparency(skin, rect!(0, 8, 32, 8));
  unsafe_remove_transparency(skin, rect!(8, 0, 16, 8));
  unsafe_remove_transparency(skin, rect!(0, 20, 56, 12));
  unsafe_remove_transparency(skin, rect!(4, 16, 8, 4));
  unsafe_remove_transparency(skin, rect!(20, 16, 16, 4));
  unsafe_remove_transparency(skin, rect!(44, 16, 8, 4));
  unsafe_remove_transparency(skin, rect!(16, 52, 32, 12));
  unsafe_remove_transparency(skin, rect!(20, 48, 8, 4));
  unsafe_remove_transparency(skin, rect!(36, 48, 8, 4));
}

unsafe fn unsafe_fill_rect(image: &mut DynamicImage, rect: Rect, pixel: Rgba<u8>) {
  for x in rect.x..rect.x + rect.width {
    for y in rect.y..rect.y + rect.height {
      image.unsafe_put_pixel(x, y, pixel);
    }
  }
}

unsafe fn unsafe_remove_transparency(image: &mut DynamicImage, rect: Rect) {
  for x in rect.x..rect.x + rect.width {
    for y in rect.y..rect.y + rect.height {
      let mut pixel = image.unsafe_get_pixel(x, y);
      let opacity = pixel[3];

      if opacity == 255 {
        continue;
      }

      let opacity = opacity as f32 / 255.0;

      pixel[0] = (opacity * pixel[0] as f32) as u8;
      pixel[1] = (opacity * pixel[1] as f32) as u8;
      pixel[2] = (opacity * pixel[2] as f32) as u8;
      pixel[3] = 255;

      image.unsafe_put_pixel(x, y, pixel);
    }
  }
}
