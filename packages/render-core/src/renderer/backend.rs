use crate::error::{Error, Result as RenderResult};

#[cfg(target_arch = "wasm32")]
pub type OutputTexture<'a> = wgpu::SurfaceTexture;

#[cfg(not(target_arch = "wasm32"))]
pub type OutputTexture<'a> = &'a wgpu::Texture;

// The futures' Send bounds can't be named here, but every render awaits them on a concrete
// backend, where the compiler checks them
#[allow(async_fn_in_trait)]
pub trait Backend {
  fn device(&self) -> &wgpu::Device;
  fn queue(&self) -> &wgpu::Queue;

  fn create_instance() -> wgpu::Instance {
    wgpu::Instance::new(&wgpu::InstanceDescriptor {
      backends: wgpu::Backends::all(),
      ..Default::default()
    })
  }

  async fn request_adapter(instance: wgpu::Instance) -> RenderResult<wgpu::Adapter> {
    instance
      .request_adapter(&wgpu::RequestAdapterOptions::default())
      .await
      .map_err(|_| Error::MissingAdapter)
  }

  async fn request_device(
    adapter: &wgpu::Adapter,
  ) -> Result<(wgpu::Device, wgpu::Queue), wgpu::RequestDeviceError>;

  fn create_config(&self) -> wgpu::SurfaceConfiguration;

  fn get_output_texture(&self) -> OutputTexture<'_>;

  fn create_view(output_texture: &OutputTexture) -> wgpu::TextureView;

  #[cfg(not(target_arch = "wasm32"))]
  async fn handle_encoder_after_render(
    &self,
    encoder: wgpu::CommandEncoder,
  ) -> RenderResult<Vec<u8>>;

  #[cfg(target_arch = "wasm32")]
  fn handle_encoder_after_render(
    &self,
    encoder: wgpu::CommandEncoder,
    output_texture: OutputTexture,
  );

  #[cfg(target_arch = "wasm32")]
  fn window(&self) -> &winit::window::Window;
}
