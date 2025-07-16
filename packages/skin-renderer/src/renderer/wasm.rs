use std::sync::Arc;
use wgpu::TextureFormat;
use winit::dpi::PhysicalSize;
use winit::window::Window;

use super::backend::{Backend, OutputTexture};
use crate::error::Result as SkinRendererResult;

pub struct WasmBackend {
  device: wgpu::Device,
  queue: wgpu::Queue,
  adapter: wgpu::Adapter,
  pub surface: wgpu::Surface<'static>,

  window: Arc<Window>,
  pub size: PhysicalSize<u32>,

  pub mouse_pressed: bool,
}

impl WasmBackend {
  pub async fn new(window: Window) -> SkinRendererResult<Self> {
    let instance = Self::create_instance();
    let window = Arc::new(window);
    let surface = instance.create_surface(Arc::clone(&window))?;
    let adapter = Self::request_adapter(instance).await?;
    let (device, queue) = Self::request_device(&adapter).await?;

    let size = window.inner_size();

    Ok(Self {
      device,
      queue,
      adapter,
      surface,
      window,
      size,
      mouse_pressed: false,
    })
  }
}

impl Backend for WasmBackend {
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
    let surface_caps = self.surface.get_capabilities(&self.adapter);

    // TODO: handle non srgb surfaces
    // If the surface isn't srgb then it will appear darker
    let surface_format = surface_caps
      .formats
      .iter()
      .copied()
      .find(|f| f.is_srgb())
      .unwrap_or(surface_caps.formats[0]);

    let config = wgpu::SurfaceConfiguration {
      usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
      format: surface_format,
      width: self.size.width,
      height: self.size.height,
      present_mode: surface_caps.present_modes[0],
      alpha_mode: surface_caps.alpha_modes[0],
      view_formats: vec![],
      desired_maximum_frame_latency: 2,
    };

    self.surface.configure(&self.device, &config);

    config
  }

  fn get_output_texture(&self) -> OutputTexture {
    self.surface.get_current_texture().unwrap()
  }

  fn create_view(output_texture: &OutputTexture) -> wgpu::TextureView {
    output_texture
      .texture
      .create_view(&wgpu::TextureViewDescriptor::default())
  }

  fn handle_encoder_after_render(
    &self,
    encoder: wgpu::CommandEncoder,
    output_texture: OutputTexture,
  ) {
    self.queue.submit(Some(encoder.finish()));
    output_texture.present();
  }

  fn window(&self) -> &Window {
    &self.window
  }
}
