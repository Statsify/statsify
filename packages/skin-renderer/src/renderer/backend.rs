#[cfg(not(target_arch = "wasm32"))]
use super::SkinRender;
#[cfg(not(target_arch = "wasm32"))]
use crate::error::{Error, Result as SkinRendererResult};

#[cfg(target_arch = "wasm32")]
pub type OutputTexture<'a> = wgpu::SurfaceTexture;

#[cfg(not(target_arch = "wasm32"))]
pub type OutputTexture<'a> = &'a wgpu::Texture;

pub trait Backend {
  fn device(&self) -> &wgpu::Device;
  fn queue(&self) -> &wgpu::Queue;

  #[cfg(not(target_arch = "wasm32"))]
  fn create_instance() -> wgpu::Instance {
    wgpu::Instance::new(&wgpu::InstanceDescriptor {
      backends: wgpu::Backends::all(),
      ..Default::default()
    })
  }

  // The wasm backend finds WebGPU itself and asks for an adapter that can draw to its canvas
  #[cfg(not(target_arch = "wasm32"))]
  async fn request_adapter(instance: wgpu::Instance) -> SkinRendererResult<wgpu::Adapter> {
    instance
      .request_adapter(&wgpu::RequestAdapterOptions::default())
      .await
      .map_err(|_| Error::MissingAdapter)
  }

  async fn request_device(
    adapter: &wgpu::Adapter,
  ) -> Result<(wgpu::Device, wgpu::Queue), wgpu::RequestDeviceError>;

  fn create_config(&self) -> wgpu::SurfaceConfiguration;

  // The wasm renderer gets its frames from the surface itself, since a browser can fail to give one
  #[cfg(not(target_arch = "wasm32"))]
  fn get_output_texture(&self) -> OutputTexture<'_>;

  fn create_view(output_texture: &OutputTexture) -> wgpu::TextureView;

  #[cfg(not(target_arch = "wasm32"))]
  async fn handle_encoder_after_render(
    &self,
    encoder: wgpu::CommandEncoder,
  ) -> SkinRendererResult<SkinRender>;

  #[cfg(target_arch = "wasm32")]
  fn handle_encoder_after_render(
    &self,
    encoder: wgpu::CommandEncoder,
    output_texture: OutputTexture,
  );

  #[cfg(target_arch = "wasm32")]
  fn window(&self) -> &winit::window::Window;
}
