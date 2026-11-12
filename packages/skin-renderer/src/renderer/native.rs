use std::sync::{Arc, Mutex};

use futures_intrusive::channel;
use image::codecs::png::PngEncoder;
use image::{ExtendedColorType, ImageEncoder};
use napi::bindgen_prelude::spawn_blocking;

use super::backend::Backend;
use super::PngBytes;
use crate::buffer_dimensions::BufferDimensions;
use crate::error::{Error, Result as SkinRendererResult};
use crate::texture::Texture;

// Smaller sizes leave no room inside the camera's pixel margins, and narrower ones pull the
// camera back until its far plane clips the player
pub const MIN_SIZE: u32 = 16;
pub const MAX_ASPECT_RATIO: u32 = 4;

pub struct NativeBackend {
  device: wgpu::Device,
  queue: wgpu::Queue,

  target: Arc<RenderTarget>,
}

impl NativeBackend {
  pub async fn new(width: u32, height: u32) -> SkinRendererResult<Self> {
    let instance = Self::create_instance();
    let adapter = Self::request_adapter(instance).await?;
    let (device, queue) = Self::request_device(&adapter).await?;

    let target = Arc::new(RenderTarget::new(&device, &Self::config(width, height)));

    Ok(Self {
      device,
      queue,
      target,
    })
  }

  fn config(width: u32, height: u32) -> wgpu::SurfaceConfiguration {
    wgpu::SurfaceConfiguration {
      usage: wgpu::TextureUsages::empty(),
      format: wgpu::TextureFormat::Rgba8UnormSrgb,
      width,
      height,
      present_mode: wgpu::PresentMode::default(),
      alpha_mode: wgpu::CompositeAlphaMode::default(),
      view_formats: vec![],
      desired_maximum_frame_latency: 2,
    }
  }

  pub fn render_target(&self, width: u32, height: u32) -> SkinRendererResult<Arc<RenderTarget>> {
    let dimensions = &self.target.dimensions;

    if width == dimensions.width && height == dimensions.height {
      return Ok(Arc::clone(&self.target));
    }

    let limit = self.device.limits().max_texture_dimension_2d;
    let (short, long) = (width.min(height), width.max(height));

    if short < MIN_SIZE || long > limit || long > short * MAX_ASPECT_RATIO {
      return Err(Error::InvalidSize(limit));
    }

    Ok(Arc::new(RenderTarget::new(
      &self.device,
      &Self::config(width, height),
    )))
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
    let dimensions = &self.target.dimensions;
    Self::config(dimensions.width, dimensions.height)
  }
}

pub struct RenderTarget {
  dimensions: BufferDimensions,

  texture: wgpu::Texture,
  texture_extent: wgpu::Extent3d,
  pub view: wgpu::TextureView,
  pub depth_texture: Texture,

  // Renders run at the same time, so each maps a buffer no other render is using
  output_buffers: Mutex<Vec<wgpu::Buffer>>,
}

impl RenderTarget {
  fn new(device: &wgpu::Device, config: &wgpu::SurfaceConfiguration) -> Self {
    let dimensions = BufferDimensions::new(config.width, config.height);

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
      format: config.format,
      usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
      view_formats: &[],
    });

    Self {
      dimensions,
      view: texture.create_view(&wgpu::TextureViewDescriptor::default()),
      texture,
      texture_extent,
      depth_texture: Texture::create_depth_texture(device, config, "depth_texture"),
      output_buffers: Mutex::default(),
    }
  }

  pub async fn read(
    &self,
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    mut encoder: wgpu::CommandEncoder,
  ) -> SkinRendererResult<PngBytes> {
    let pooled = self.output_buffers.lock().unwrap().pop();
    let output_buffer = pooled.unwrap_or_else(|| {
      device.create_buffer(&wgpu::BufferDescriptor {
        label: None,
        size: (self.dimensions.padded_bytes_per_row * self.dimensions.height) as u64,
        usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: false,
      })
    });

    encoder.copy_texture_to_buffer(
      self.texture.as_image_copy(),
      wgpu::TexelCopyBufferInfo {
        buffer: &output_buffer,
        layout: wgpu::TexelCopyBufferLayout {
          offset: 0,
          bytes_per_row: Some(self.dimensions.padded_bytes_per_row),
          rows_per_image: Some(self.dimensions.height),
        },
      },
      self.texture_extent,
    );

    let index = queue.submit(Some(encoder.finish()));

    let buffer_slice = output_buffer.slice(..);
    let (sender, receiver) = channel::shared::oneshot_channel();
    buffer_slice.map_async(wgpu::MapMode::Read, move |v| sender.send(v).unwrap());

    // Waiting on the GPU blocks the thread, so it runs off napi's async workers
    let device = device.clone();
    spawn_blocking(move || device.poll(wgpu::PollType::WaitForSubmissionIndex(index)))
      .await
      .map_err(|_| Error::RenderFailure)??;

    let Some(Ok(())) = receiver.receive().await else {
      return Err(Error::RenderFailure);
    };

    let png = {
      let padded_buffer = buffer_slice.get_mapped_range();

      let buffer = padded_buffer
        .chunks(self.dimensions.padded_bytes_per_row as usize)
        .take(self.dimensions.height as usize)
        .flat_map(|row| &row[..self.dimensions.unpadded_bytes_per_row as usize])
        .copied()
        .collect::<Vec<u8>>();

      let mut png = Vec::new();

      PngEncoder::new(&mut png).write_image(
        &buffer,
        self.dimensions.width,
        self.dimensions.height,
        ExtendedColorType::Rgba8,
      )?;

      png
    };

    output_buffer.unmap();
    self.output_buffers.lock().unwrap().push(output_buffer);

    Ok(png)
  }
}
