use crate::texture::Texture;
use bytemuck::{Pod, Zeroable};
use std::mem::size_of;

pub trait Vertex {
  fn desc<'a>() -> wgpu::VertexBufferLayout<'a>;
}

#[repr(C)]
#[derive(Copy, Clone, Debug, Pod, Zeroable)]
pub struct ModelVertex {
  pub position: [f32; 3],
  pub tex_coords: [f32; 2],
  pub normal: [f32; 3],
}

impl Vertex for ModelVertex {
  fn desc<'a>() -> wgpu::VertexBufferLayout<'a> {
    wgpu::VertexBufferLayout {
      array_stride: size_of::<ModelVertex>() as wgpu::BufferAddress,
      step_mode: wgpu::VertexStepMode::Vertex,
      attributes: &[
        wgpu::VertexAttribute {
          offset: 0,
          shader_location: 0,
          format: wgpu::VertexFormat::Float32x3,
        },
        wgpu::VertexAttribute {
          offset: size_of::<[f32; 3]>() as wgpu::BufferAddress,
          shader_location: 1,
          format: wgpu::VertexFormat::Float32x2,
        },
        wgpu::VertexAttribute {
          offset: size_of::<[f32; 5]>() as wgpu::BufferAddress,
          shader_location: 2,
          format: wgpu::VertexFormat::Float32x3,
        },
      ],
    }
  }
}

pub struct Material {
  pub diffuse_texture: Texture,
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

    Self {
      diffuse_texture,
      bind_group,
    }
  }
}

pub struct Mesh {
  pub name: String,
  pub vertex_buffer: wgpu::Buffer,
  pub index_buffer: wgpu::Buffer,
  pub num_elements: u32,
  pub material: usize,
}

pub struct Model {
  pub meshes: Vec<Mesh>,
  pub materials: Vec<Material>,
}

pub trait DrawModel<'a> {
  fn draw_mesh(
    &mut self,
    mesh: &'a Mesh,
    material: &'a Material,
    camera_bind_group: &'a wgpu::BindGroup,
    light_bind_group: &'a wgpu::BindGroup,
  );

  fn draw_model(
    &mut self,
    model: &'a Model,
    material: &'a Material,
    camera_bind_group: &'a wgpu::BindGroup,
    light_bind_group: &'a wgpu::BindGroup,
  );
}

impl<'a> DrawModel<'a> for wgpu::RenderPass<'a> {
  fn draw_mesh(
    &mut self,
    mesh: &'a Mesh,
    material: &'a Material,
    camera_bind_group: &'a wgpu::BindGroup,
    light_bind_group: &'a wgpu::BindGroup,
  ) {
    self.set_vertex_buffer(0, mesh.vertex_buffer.slice(..));
    self.set_index_buffer(mesh.index_buffer.slice(..), wgpu::IndexFormat::Uint32);
    self.set_bind_group(0, &material.bind_group, &[]);
    self.set_bind_group(1, camera_bind_group, &[]);
    self.set_bind_group(2, light_bind_group, &[]);
    self.draw_indexed(0..mesh.num_elements, 0, 0..1);
  }

  fn draw_model(
    &mut self,
    model: &'a Model,
    material: &'a Material,
    camera_bind_group: &'a wgpu::BindGroup,
    light_bind_group: &'a wgpu::BindGroup,
  ) {
    for mesh in &model.meshes {
      self.draw_mesh(mesh, material, camera_bind_group, light_bind_group);
    }
  }
}
