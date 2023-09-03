use bytes::{Bytes, BytesMut};
use image::DynamicImage;
use reqwest::Client;

use crate::error::{SkinRendererError, SkinRendererResult};

fn has_trasnparency(image: &[u8], x0: usize, y0: usize, width: usize, height: usize) -> bool {
  for x in x0..width {
    for y in y0..height {
      let index = (y * width + x) * 4;

      if image[index + 3] != 255 {
        return true;
      }
    }
  }

  false
}

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

impl SkinLoader {
  pub fn new() -> Self {
    Self {
      client: Client::new(),
    }
  }

  pub async fn get_skin(&self, url: &str) -> SkinRendererResult<Vec<u8>> {
    let response = self.client.get(url).send().await?;

    if response.status().is_success() {
      let bytes = response.bytes().await?;
      let skin = image::load_from_memory(&bytes)?;

      let skin = Self::process_skin(skin);
      Ok(skin.to_vec())
    } else {
      Err(SkinRendererError::MissingSkinTexture)
    }
  }

  fn process_skin(skin: DynamicImage) -> Bytes {
    let format = Self::skin_format(&skin);

    println!("Skin format: {:?}", format);

    let mut skin = match format {
      SkinFormat::Legacy => Self::convert_legacy_skin(skin),
      SkinFormat::Modern => skin,
    };

    Self::fix_opacity(&mut skin);

    skin
  }

  fn skin_format(skin: &DynamicImage) -> SkinFormat {
    if skin.height() == SkinFormat::Legacy as u32 {
      SkinFormat::Legacy
    } else {
      SkinFormat::Modern
    }
  }

  fn convert_legacy_skin(legacy_skin: DynamicImage) -> DynamicImage {
    legacy_skin.resize(nwidth, nheight, filter)

    copy_region(&mut skin, 4, 16, 4, 4, 20, 48); // Top Leg
    copy_region(&mut skin, 8, 16, 4, 4, 24, 48); // Bottom Leg
    copy_region(&mut skin, 0, 20, 4, 12, 24, 52); // Outer Leg
    copy_region(&mut skin, 4, 20, 4, 12, 20, 52); // Front Leg
    copy_region(&mut skin, 8, 20, 4, 12, 16, 52); // Inner Leg
    copy_region(&mut skin, 12, 20, 4, 12, 28, 52); // Back Leg
    copy_region(&mut skin, 44, 16, 4, 4, 36, 48); // Top Arm
    copy_region(&mut skin, 48, 16, 4, 4, 40, 48); // Bottom Arm
    copy_region(&mut skin, 40, 20, 4, 12, 40, 52); // Outer Arm
    copy_region(&mut skin, 44, 20, 4, 12, 36, 52); // Front Arm
    copy_region(&mut skin, 48, 20, 4, 12, 32, 52); // Inner Arm
    copy_region(&mut skin, 52, 20, 4, 12, 44, 52); // Back Arm

    skin.freeze()
  }

  fn fix_opacity(skin: &mut DynamicImage) {}
}

fn copy_region(
  bytes: &mut BytesMut,
  x0: usize,
  y0: usize,
  width: usize,
  height: usize,
  x1: usize,
  y1: usize,
) {
  let src_start = to_pixel(x0, y0, width);
  let src_end = to_pixel(x0, y0 + height, width);
  let src = src_start..src_end;

  let dest_start = to_pixel(x1, y1, width);

  bytes.copy_within(src, dest_start);
}

fn to_pixel(x: usize, y: usize, width: usize) -> usize {
  (y * width + x) * 4
}
