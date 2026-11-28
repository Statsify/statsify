use std::mem::size_of;

pub struct BufferDimensions {
  pub width: u32,
  pub height: u32,
  pub unpadded_bytes_per_row: u32,
  pub padded_bytes_per_row: u32,
}

impl BufferDimensions {
  pub fn new(width: u32, height: u32) -> Self {
    let bytes_per_pixel = size_of::<u32>() as u32;
    let unpadded_bytes_per_row = width * bytes_per_pixel;

    let align = wgpu::COPY_BYTES_PER_ROW_ALIGNMENT;

    let padded_bytes_per_row_padding = (align - unpadded_bytes_per_row % align) % align;
    let padded_bytes_per_row = unpadded_bytes_per_row + padded_bytes_per_row_padding;

    Self {
      width,
      height,
      unpadded_bytes_per_row,
      padded_bytes_per_row,
    }
  }
}
