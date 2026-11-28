use std::sync::mpsc;

use image::codecs::png::PngEncoder;
use image::{ExtendedColorType, ImageEncoder};
use napi::bindgen_prelude::spawn_blocking;

use super::backend::{Backend, OutputTexture};
use super::PngBytes;
use crate::buffer_dimensions::BufferDimensions;
use crate::error::{Error, Result as SkinRendererResult};

pub struct NativeBackend {
  device: wgpu::Device,
  queue: wgpu::Queue,

  dimensions: BufferDimensions,

  texture: wgpu::Texture,
  texture_extent: wgpu::Extent3d,
}

impl NativeBackend {
  pub async fn new(width: u32, height: u32) -> SkinRendererResult<Self> {
    let instance = Self::create_instance();
    let adapter = Self::request_adapter(instance).await?;
    let (device, queue) = Self::request_device(&adapter).await?;

    let dimensions = BufferDimensions::new(width, height);

    let texture_extent = wgpu::Extent3d {
      width: dimensions.width,
      height: dimensions.height,
      depth_or_array_layers: 1,
    };

    let texture = device.create_texture(&wgpu::TextureDescriptor {
      label: None,
      size: texture_extent,
      mip_level_count: 1,
      sample_count: 1,
      dimension: wgpu::TextureDimension::D2,
      format: wgpu::TextureFormat::Rgba8UnormSrgb,
      usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
      view_formats: &[],
    });

    Ok(Self {
      device,
      queue,
      dimensions,
      texture,
      texture_extent,
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
      width: self.dimensions.width,
      height: self.dimensions.height,
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
  ) -> SkinRendererResult<PngBytes> {
    let dimensions = self.dimensions;

    let output_buffer = self.device.create_buffer(&wgpu::BufferDescriptor {
      label: None,
      size: (dimensions.padded_bytes_per_row * dimensions.height) as u64,
      usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    encoder.copy_texture_to_buffer(
      self.texture.as_image_copy(),
      wgpu::TexelCopyBufferInfo {
        buffer: &output_buffer,
        layout: wgpu::TexelCopyBufferLayout {
          offset: 0,
          bytes_per_row: Some(dimensions.padded_bytes_per_row),
          rows_per_image: Some(dimensions.height),
        },
      },
      self.texture_extent,
    );

    // Waiting on the GPU blocks the thread, so it runs off napi's async workers. submit goes
    // with it: it waits on the device lock a running poll holds until its GPU work finishes
    let device = self.device.clone();
    let queue = self.queue.clone();
    let command_buffer = encoder.finish();

    spawn_blocking(move || {
      let index = queue.submit(Some(command_buffer));

      let buffer_slice = output_buffer.slice(..);
      let (sender, receiver) = mpsc::channel();
      buffer_slice.map_async(wgpu::MapMode::Read, move |v| {
        let _ = sender.send(v);
      });

      device.poll(wgpu::PollType::WaitForSubmissionIndex(index))?;

      let Ok(Ok(())) = receiver.recv() else {
        return Err(Error::RenderFailure);
      };

      let padded_buffer = buffer_slice.get_mapped_range();

      let buffer = padded_buffer
        .chunks(dimensions.padded_bytes_per_row as usize)
        .take(dimensions.height as usize)
        .flat_map(|row| &row[..dimensions.unpadded_bytes_per_row as usize])
        .copied()
        .collect::<Vec<u8>>();

      let mut png = Vec::new();

      PngEncoder::new(&mut png).write_image(
        &buffer,
        dimensions.width,
        dimensions.height,
        ExtendedColorType::Rgba8,
      )?;

      Ok(png)
    })
    .await
    .map_err(|_| Error::RenderFailure)?
  }
}
