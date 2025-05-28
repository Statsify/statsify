use bytemuck::cast_slice;
use wgpu::util::DeviceExt;

use crate::geometry::Geometry;
use crate::material::Material;

pub struct Mesh {
  indices: u32,
  vertex_buffer: wgpu::Buffer,
  index_buffer: wgpu::Buffer,
}

impl Mesh {
  pub fn from_geometry(device: &wgpu::Device, geometry: Geometry) -> Self {
    let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Vertex Buffer"),
      contents: cast_slice(&geometry.vertices),
      usage: wgpu::BufferUsages::VERTEX,
    });

    let indices = geometry.indices;

    let index_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Index Buffer"),
      contents: cast_slice(&indices),
      usage: wgpu::BufferUsages::INDEX,
    });

    Self {
      indices: indices.len() as u32,
      vertex_buffer,
      index_buffer,
    }
  }
}

pub trait DrawMesh<'a> {
  fn draw_mesh(
    &mut self,
    mesh: &'a Mesh,
    material: &'a Material,
    camera_bind_group: &'a wgpu::BindGroup,
    light_bind_group: &'a wgpu::BindGroup,
  );
}

impl<'a> DrawMesh<'a> for wgpu::RenderPass<'a> {
  fn draw_mesh(
    &mut self,
    mesh: &'a Mesh,
    material: &'a Material,
    camera_bind_group: &'a wgpu::BindGroup,
    light_bind_group: &'a wgpu::BindGroup,
  ) {
    // wgpu panics if the mesh is empty: https://github.com/gfx-rs/wgpu/issues/6779
    if mesh.indices == 0 {
      return;
    }

    self.set_vertex_buffer(0, mesh.vertex_buffer.slice(..));
    self.set_index_buffer(mesh.index_buffer.slice(..), wgpu::IndexFormat::Uint32);
    self.set_bind_group(0, &material.bind_group, &[]);
    self.set_bind_group(1, camera_bind_group, &[]);
    self.set_bind_group(2, light_bind_group, &[]);
    self.draw_indexed(0..mesh.indices, 0, 0..1);
  }
}
