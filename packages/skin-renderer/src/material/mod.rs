use crate::texture::Texture;

pub struct Material {
  pub bind_group: wgpu::BindGroup,
}

impl Material {
  pub fn new(
    device: &wgpu::Device,
    diffuse_texture: Texture,
    layout: &wgpu::BindGroupLayout,
  ) -> Self {
    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      layout,
      entries: &[
        wgpu::BindGroupEntry {
          binding: 0,
          resource: wgpu::BindingResource::TextureView(&diffuse_texture.view),
        },
        wgpu::BindGroupEntry {
          binding: 1,
          resource: wgpu::BindingResource::Sampler(&diffuse_texture.sampler),
        },
      ],
      label: None,
    });

    Self { bind_group }
  }
}
