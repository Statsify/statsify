use crate::error::Result;
use crate::texture::Texture;

pub struct Material {
  pub(crate) bind_group: wgpu::BindGroup,
  pub(crate) blends: bool,
}

impl Material {
  pub fn new(
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    layout: &wgpu::BindGroupLayout,
    sampler: &wgpu::Sampler,
    image: &image::DynamicImage,
  ) -> Result<Self> {
    let rgba = image.to_rgba8();
    let diffuse_texture = Texture::from_image(device, queue, &rgba)?;

    // The texels blended_color keeps; without one, the blended pass would draw nothing
    let blends = rgba.pixels().any(|pixel| pixel[3] > 25 && pixel[3] < 255);

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

    Ok(Self { bind_group, blends })
  }
}
