use crate::error::Result;
use crate::texture::Texture;

pub struct Material {
  pub bind_group: wgpu::BindGroup,
}

impl Material {
  pub fn new(
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    layout: &wgpu::BindGroupLayout,
    sampler: &wgpu::Sampler,
    image: &image::DynamicImage,
  ) -> Result<Self> {
    let diffuse_texture = Texture::from_image(device, queue, image)?;

    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      layout,
      entries: &[
        wgpu::BindGroupEntry {
          binding: 0,
          resource: wgpu::BindingResource::TextureView(&diffuse_texture.view),
        },
        wgpu::BindGroupEntry {
          binding: 1,
          resource: wgpu::BindingResource::Sampler(sampler),
        },
      ],
      label: None,
    });

    Ok(Self { bind_group })
  }
}
