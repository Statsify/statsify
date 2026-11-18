use std::io::{BufWriter, Cursor};

use futures_intrusive::channel;
use image::{ImageBuffer, Rgba};

use super::backend::{Backend, OutputTexture};
use crate::buffer_dimensions::BufferDimensions;
use crate::error::{Error, Result as RenderResult};

pub struct NativeBackend {
  device: wgpu::Device,
  queue: wgpu::Queue,

  texture: wgpu::Texture,
}

impl NativeBackend {
  pub async fn new(width: u32, height: u32) -> RenderResult<Self> {
    let instance = Self::create_instance();
    let adapter = Self::request_adapter(instance).await?;
    let (device, queue) = Self::request_device(&adapter).await?;

    let texture = Self::create_texture(&device, width, height);

    Ok(Self {
      device,
      queue,
      texture,
    })
  }

  pub(crate) fn create_texture(device: &wgpu::Device, width: u32, height: u32) -> wgpu::Texture {
    device.create_texture(&wgpu::TextureDescriptor {
      label: None,
      size: wgpu::Extent3d {
        width,
        height,
        depth_or_array_layers: 1,
      },
      mip_level_count: 1,
      sample_count: 1,
      dimension: wgpu::TextureDimension::D2,
      format: wgpu::TextureFormat::Rgba8UnormSrgb,
      usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
      view_formats: &[],
    })
  }
}

impl Backend for NativeBackend {
  fn device(&self) -> &wgpu::Device {
    &self.device
  }

  fn queue(&self) -> &wgpu::Queue {
    &self.queue
  }

  async fn request_device(
    adapter: &wgpu::Adapter,
  ) -> Result<(wgpu::Device, wgpu::Queue), wgpu::RequestDeviceError> {
    adapter
      .request_device(&wgpu::DeviceDescriptor {
        label: None,
        required_features: wgpu::Features::empty(),
        required_limits: wgpu::Limits::downlevel_defaults(),
        memory_hints: Default::default(),
        trace: wgpu::Trace::Off,
      })
      .await
  }

  fn create_config(&self) -> wgpu::SurfaceConfiguration {
    wgpu::SurfaceConfiguration {
      usage: wgpu::TextureUsages::empty(),
      format: self.texture.format(),
      width: self.texture.width(),
      height: self.texture.height(),
      present_mode: wgpu::PresentMode::default(),
      alpha_mode: wgpu::CompositeAlphaMode::default(),
      view_formats: vec![],
      desired_maximum_frame_latency: 2,
    }
  }

  fn get_output_texture(&self) -> OutputTexture<'_> {
    &self.texture
  }

  fn create_view(output_texture: &OutputTexture) -> wgpu::TextureView {
    output_texture.create_view(&wgpu::TextureViewDescriptor::default())
  }

  async fn handle_encoder_after_render(
    &self,
    mut encoder: wgpu::CommandEncoder,
    output_texture: OutputTexture<'_>,
    unpremultiply: bool,
  ) -> RenderResult<Vec<u8>> {
    let dimensions = BufferDimensions::new(output_texture.width(), output_texture.height());

    let output_buffer = self.device.create_buffer(&wgpu::BufferDescriptor {
      label: None,
      size: (dimensions.padded_bytes_per_row * dimensions.height) as u64,
      usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    encoder.copy_texture_to_buffer(
      output_texture.as_image_copy(),
      wgpu::TexelCopyBufferInfo {
        buffer: &output_buffer,
        layout: wgpu::TexelCopyBufferLayout {
          offset: 0,
          bytes_per_row: Some(dimensions.padded_bytes_per_row),
          rows_per_image: Some(dimensions.height),
        },
      },
      output_texture.size(),
    );

    let index = self.queue.submit(Some(encoder.finish()));

    let buffer_slice = output_buffer.slice(..);
    let (sender, receiver) = channel::shared::oneshot_channel();
    buffer_slice.map_async(wgpu::MapMode::Read, move |v| sender.send(v).unwrap());

    self
      .device
      .poll(wgpu::PollType::WaitForSubmissionIndex(index))?;

    if let Some(Ok(())) = receiver.receive().await {
      let padded_buffer = buffer_slice.get_mapped_range();

      let mut buffer = padded_buffer
        .chunks(dimensions.padded_bytes_per_row as usize)
        .take(dimensions.height as usize)
        .flat_map(|row| &row[..dimensions.unpadded_bytes_per_row as usize])
        .copied()
        .collect::<Vec<u8>>();

      if unpremultiply {
        unpremultiply_pixels(&mut buffer);
      }

      let image = ImageBuffer::<Rgba<u8>, _>::from_vec(dimensions.width, dimensions.height, buffer)
        .expect("Failed to create image buffer");

      let mut writer = BufWriter::new(Cursor::new(Vec::new()));

      image.write_to(&mut writer, image::ImageFormat::Png)?;

      let bytes = writer.into_inner().unwrap().into_inner();

      Ok(bytes)
    } else {
      Err(Error::RenderFailure)
    }
  }
}

// Blending over the transparent clear color leaves partly covered pixels premultiplied, in
// linear light. Dividing the coverage back out shows them in their own color over any background.
fn unpremultiply_pixels(rgba: &mut [u8]) {
  for pixel in rgba.chunks_exact_mut(4) {
    let alpha = pixel[3];

    if alpha == 0 || alpha == u8::MAX {
      continue;
    }

    for channel in &mut pixel[..3] {
      let linear = srgb_to_linear(*channel as f32 / 255.0) / (alpha as f32 / 255.0);
      *channel = (linear_to_srgb(linear.min(1.0)) * 255.0).round() as u8;
    }
  }
}

fn srgb_to_linear(value: f32) -> f32 {
  if value <= 0.04045 {
    value / 12.92
  } else {
    ((value + 0.055) / 1.055).powf(2.4)
  }
}

fn linear_to_srgb(value: f32) -> f32 {
  if value <= 0.0031308 {
    value * 12.92
  } else {
    1.055 * value.powf(1.0 / 2.4) - 0.055
  }
}
