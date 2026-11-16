use std::io::Cursor;

use image::ImageFormat;
use serde_json::Value;

use crate::{Error, Pack};

/// 1.8 draws items with an alpha test at 0.1, so a texel with this alpha or less never shows.
pub const ALPHA_CUTOFF: u8 = 25;

const MAX_TEXTURE_PIXELS: u64 = 4096 * 4096;

pub struct Texture {
  pub width: u32,
  pub height: u32,
  /// RGBA8, row by row from the top.
  pub rgba: Vec<u8>,
  /// Whether some texel passes the alpha test without being opaque, so the texture needs blending
  /// rather than a cutout.
  pub translucent: bool,
}

/// Which frame of an animated strip to draw.
#[derive(Clone, Copy, Debug)]
pub enum Frame {
  /// The frame shown this many game ticks into the animation, so tick 0 is the first.
  Tick(u64),
  /// The frame the animation holds longest at once, the first of equal holds: the look a strip
  /// rests on between bursts of motion, and tick 0's frame when every frame lasts as long.
  Resting,
}

/// Decodes a texture, cut to one frame when it's an animated strip.
pub fn load_texture(pack: &Pack, name: &str, frame: Frame) -> Result<Texture, Error> {
  let bytes = pack
    .textures
    .get(name)
    .ok_or_else(|| Error::MissingTexture(name.to_string()))?;

  let (width, height) =
    image::ImageReader::with_format(Cursor::new(bytes), ImageFormat::Png).into_dimensions()?;

  if u64::from(width) * u64::from(height) > MAX_TEXTURE_PIXELS {
    return Err(Error::TextureTooLarge(name.to_string()));
  }

  let image = image::load_from_memory_with_format(bytes, ImageFormat::Png)?.into_rgba8();
  let (width, mut height) = image.dimensions();
  let mut rgba = image.into_raw();

  if let Some(mcmeta) = pack.mcmeta.get(name) {
    let shown =
      animation_frame(mcmeta, height / width, frame).map_err(|reason| Error::InvalidAnimation {
        name: name.to_string(),
        reason,
      })?;

    // 1.8 cuts strips into squares as wide as the image, top to bottom, and drops a partial square
    // at the bottom; it ignores the metadata's width and height
    if let Some(frame) = shown {
      let frame_bytes = width as usize * width as usize * 4;
      rgba = rgba[frame * frame_bytes..][..frame_bytes].to_vec();
      height = width;
    }
  }

  let translucent = rgba
    .chunks_exact(4)
    .any(|texel| texel[3] > ALPHA_CUTOFF && texel[3] < u8::MAX);

  Ok(Texture {
    width,
    height,
    rgba,
    translucent,
  })
}

/// The strip frame to draw, or None when the metadata has no animation section.
fn animation_frame(mcmeta: &str, frame_count: u32, wanted: Frame) -> Result<Option<usize>, String> {
  let root = crate::parse_json(mcmeta)?;

  let Some(animation) = root.get("animation") else {
    return Ok(None);
  };

  if !animation.is_object() {
    return Err("animation is not an object".to_string());
  }

  let frametime = match animation.get("frametime") {
    None => 1,
    Some(value) => duration(value).ok_or("frametime is not a number from 1 to 2147483647")?,
  };

  let listed: &[Value] = match animation.get("frames") {
    None => &[][..],
    Some(frames) => frames.as_array().ok_or("frames is not an array")?,
  };

  let mut frames = Vec::new();

  for frame in listed {
    let entry = match frame {
      Value::Object(_) => {
        let index = frame
          .get("index")
          .and_then(whole)
          .ok_or("frame index is missing or invalid")?;

        let time = match frame.get("time") {
          None => frametime,
          Some(time) => duration(time).ok_or("frame time is not a number from 1 to 2147483647")?,
        };

        (index, time)
      }
      // 1.8 skips a frame that isn't an object, number, string or bool
      Value::Null | Value::Array(_) => continue,
      _ => (
        whole(frame).ok_or("frame is negative or not a number")?,
        frametime,
      ),
    };

    frames.push(entry);
  }

  if frames.is_empty() {
    frames = (0..u64::from(frame_count))
      .map(|index| (index, frametime))
      .collect();
  }

  if let Some((index, _)) = frames
    .iter()
    .find(|(index, _)| *index >= u64::from(frame_count))
  {
    return Err(format!(
      "frame {index} is outside the {frame_count}-frame strip"
    ));
  }

  let cycle = frames
    .iter()
    .try_fold(0u64, |sum, (_, time)| sum.checked_add(*time))
    .ok_or("the frame times overflow")?;

  if cycle == 0 {
    return Err("the strip has no frames".to_string());
  }

  let Frame::Tick(tick) = wanted else {
    // Reversed, since max_by_key keeps the last of equal holds
    let resting = frames.iter().rev().max_by_key(|(_, time)| time);
    return Ok(resting.map(|(index, _)| *index as usize));
  };

  let mut remaining = tick % cycle;

  for (index, time) in frames {
    if remaining < time {
      return Ok(Some(index as usize));
    }

    remaining -= time;
  }

  unreachable!("the remainder is below the cycle length")
}

// 1.8 drops a fraction from these numbers: a frametime of 1.5 is 1
fn whole(value: &Value) -> Option<u64> {
  let number = value.as_f64()?.trunc();
  (number >= 0.0).then_some(number as u64)
}

// 1.8 takes frame times from 1 to i32::MAX; 0 would never advance
fn duration(value: &Value) -> Option<u64> {
  whole(value).filter(|ticks| (1..=i32::MAX as u64).contains(ticks))
}

#[cfg(test)]
mod tests {
  use std::io::Cursor;

  use image::{Rgba, RgbaImage};

  use super::*;

  /// The red channel of the frame shown at `tick`, whether it's translucent, and its height.
  fn shown(pack: &Pack, tick: u64) -> (u8, bool, u32) {
    let texture = load_texture(pack, "blocks/strip", Frame::Tick(tick)).unwrap();
    (texture.rgba[0], texture.translucent, texture.height)
  }

  fn rejected(pack: &Pack) -> bool {
    let texture = load_texture(pack, "blocks/strip", Frame::Tick(0));
    matches!(texture, Err(Error::InvalidAnimation { .. }))
  }

  fn png(image: &RgbaImage) -> Vec<u8> {
    let mut png = Vec::new();
    image
      .write_to(&mut Cursor::new(&mut png), ImageFormat::Png)
      .unwrap();
    png
  }

  #[test]
  fn picks_strip_frames_by_tick() {
    // Four 1x1 frames, each red with its own index; alpha 25 is cut by the alpha test, 26 isn't
    let alphas = [255, 25, 26, 255];
    let strip = RgbaImage::from_fn(1, 4, |_, y| Rgba([y as u8, 0, 0, alphas[y as usize]]));

    let mut pack = Pack::default();
    pack.textures.insert("blocks/strip".into(), png(&strip));

    let listed =
      r#"{ "animation": { "frametime": 2, "frames": [1, { "index": 2, "time": 3 }, 0,], } }"#;
    pack.mcmeta.insert("blocks/strip".into(), listed.into());

    // Frame 1 for ticks 0 and 1, frame 2 for 2 to 4, frame 0 for 5 and 6, then around again
    assert_eq!(shown(&pack, 0), (1, false, 1));
    assert_eq!(shown(&pack, 2), (2, true, 1));
    assert_eq!(shown(&pack, 4), (2, true, 1));
    assert_eq!(shown(&pack, 6), (0, false, 1));
    assert_eq!(shown(&pack, 7), (1, false, 1));

    pack
      .mcmeta
      .insert("blocks/strip".into(), r#"{ "animation": {} }"#.into());
    assert_eq!(shown(&pack, 3), (3, false, 1));
    assert_eq!(shown(&pack, 5), (1, false, 1));

    pack.mcmeta.insert(
      "blocks/strip".into(),
      r#"{ "texture": { "blur": true } }"#.into(),
    );
    assert_eq!(shown(&pack, 0), (0, true, 4));

    pack.mcmeta.insert(
      "blocks/strip".into(),
      r#"{ "animation": { "frametime": 2147483647 } }"#.into(),
    );
    assert_eq!(shown(&pack, 2147483647), (1, false, 1));

    // Fractions are dropped, and empty slots, nulls and arrays skipped: frame 3 for a tick, then 2
    // for two
    let lenient = r#"{ "animation": { "frametime": 1.5, "frames": [3,, null, [0], { "index": 2.9,
      "time": 2.2 },] } }"#;
    pack.mcmeta.insert("blocks/strip".into(), lenient.into());
    assert_eq!(shown(&pack, 0), (3, false, 1));
    assert_eq!(shown(&pack, 2), (2, true, 1));
    assert_eq!(shown(&pack, 3), (3, false, 1));

    for invalid in [
      r#"{ "animation": { "frames": [4] } }"#,
      r#"{ "animation": { "frametime": 9223372036854775808 } }"#,
      r#"{ "animation": { "frametime": 0.5 } }"#,
      r#"{ "animation": { "frames": [{ "index": 0, "time": 2147483648 }] } }"#,
      r#"{ "animation": { "frames": [0, "1"] } }"#,
      r#"{ "animation": [] }"#,
    ] {
      pack.mcmeta.insert("blocks/strip".into(), invalid.into());
      assert!(rejected(&pack), "{invalid}");
    }

    // Two 2x2 frames over a 2x5 image: the last row is dropped, so the cycle is two ticks
    let ragged = RgbaImage::from_fn(2, 5, |_, y| Rgba([y as u8, 0, 0, 255]));
    pack.textures.insert("blocks/strip".into(), png(&ragged));
    pack
      .mcmeta
      .insert("blocks/strip".into(), r#"{ "animation": {} }"#.into());
    assert_eq!(shown(&pack, 1), (2, false, 2));
    assert_eq!(shown(&pack, 2), (0, false, 2));

    pack
      .textures
      .insert("blocks/strip".into(), png(&RgbaImage::new(2, 1)));
    assert!(rejected(&pack));
  }

  #[test]
  fn rests_on_the_longest_held_frame() {
    let strip = RgbaImage::from_fn(1, 4, |_, y| Rgba([y as u8, 0, 0, 255]));
    let mut pack = Pack::default();
    pack.textures.insert("blocks/strip".into(), png(&strip));

    let mut resting = |mcmeta: &str| {
      pack.mcmeta.insert("blocks/strip".into(), mcmeta.into());
      load_texture(&pack, "blocks/strip", Frame::Resting)
        .unwrap()
        .rgba[0]
    };

    assert_eq!(
      resting(r#"{ "animation": { "frames": [1, 2, { "index": 3, "time": 9 }] } }"#),
      3
    );
    assert_eq!(
      resting(
        r#"{ "animation": { "frames": [0, { "index": 2, "time": 5 }, { "index": 1, "time": 5 }] } }"#
      ),
      2
    );
    assert_eq!(
      resting(r#"{ "animation": { "frametime": 3, "frames": [2, 1, 0, 1] } }"#),
      2
    );
    assert_eq!(resting(r#"{ "animation": {} }"#), 0);
  }
}
