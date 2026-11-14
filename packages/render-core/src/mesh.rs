use bytemuck::cast_slice;
use cgmath::Point3;
use wgpu::util::DeviceExt;

use crate::geometry::Geometry;
use crate::material::Material;

pub struct Mesh {
  indices: u32,
  vertex_buffer: wgpu::Buffer,
  index_buffer: wgpu::Buffer,
  // The middle of its bounds, which orders translucent draws
  pub(crate) center: Point3<f32>,
}

impl Mesh {
  pub fn from_geometry(device: &wgpu::Device, geometry: Geometry) -> Self {
    let (min, max) =
      geometry
        .vertices
        .iter()
        .fold(([f32::MAX; 3], [f32::MIN; 3]), |(min, max), vertex| {
          (
            std::array::from_fn(|axis| min[axis].min(vertex.position[axis])),
            std::array::from_fn(|axis| max[axis].max(vertex.position[axis])),
          )
        });

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
      center: Point3::from(std::array::from_fn(|axis| (min[axis] + max[axis]) / 2.0)),
    }
  }
}

pub(crate) trait DrawMesh<'a> {
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
