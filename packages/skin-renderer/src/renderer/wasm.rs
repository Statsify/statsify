use std::sync::Arc;
use winit::dpi::PhysicalSize;
use winit::window::Window;

use super::backend::{Backend, OutputTexture};
use crate::error::{Error, Result as SkinRendererResult};

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
    // Some browsers have WebGPU but no adapter for it, and then draw with WebGL
    let instance = wgpu::util::new_instance_with_webgpu_detection(&wgpu::InstanceDescriptor {
      backends: wgpu::Backends::all(),
      ..Default::default()
    })
    .await;
    let window = Arc::new(window);
    let surface = instance.create_surface(Arc::clone(&window))?;

    // WebGL's adapter comes from the canvas's context, so it needs the surface
    let adapter = instance
      .request_adapter(&wgpu::RequestAdapterOptions {
        compatible_surface: Some(&surface),
        ..Default::default()
      })
      .await
      .map_err(|_| Error::MissingAdapter)?;
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
        // WebGL2 has no compute, so the limits are its own, with the adapter's texture size
        required_limits: wgpu::Limits::downlevel_webgl2_defaults()
          .using_resolution(adapter.limits()),
        memory_hints: Default::default(),
        trace: wgpu::Trace::Off,
      })
      .await
  }

  fn create_config(&self) -> wgpu::SurfaceConfiguration {
    let surface_caps = self.surface.get_capabilities(&self.adapter);

    let surface_format = surface_caps
      .formats
      .iter()
      .copied()
      .find(|f| f.is_srgb())
      .unwrap_or(surface_caps.formats[0]);

    // An opaque canvas paints the page behind the model black. WebGPU canvases take
    // premultiplied alpha though wgpu lists only opaque; WebGL's are transparent already
    let alpha_mode = match self.adapter.get_info().backend {
      wgpu::Backend::BrowserWebGpu => wgpu::CompositeAlphaMode::PreMultiplied,
      _ => surface_caps.alpha_modes[0],
    };

    // WebGPU canvases offer no sRGB format, so the model is drawn through an sRGB view of
    // the canvas's format; drawn straight to it, the model comes out darker
    let config = wgpu::SurfaceConfiguration {
      usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
      format: surface_format,
      // A new window has no size until the browser lays its canvas out, and its first
      // resize sets the real one
      width: self.size.width.max(1),
      height: self.size.height.max(1),
      present_mode: surface_caps.present_modes[0],
      alpha_mode,
      view_formats: vec![surface_format.add_srgb_suffix()],
      desired_maximum_frame_latency: 2,
    };

    self.surface.configure(&self.device, &config);

    config
  }

  fn create_view(output_texture: &OutputTexture) -> wgpu::TextureView {
    let texture = &output_texture.texture;

    texture.create_view(&wgpu::TextureViewDescriptor {
      format: Some(texture.format().add_srgb_suffix()),
      ..Default::default()
    })
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
