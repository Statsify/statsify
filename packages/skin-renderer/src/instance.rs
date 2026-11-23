use bytemuck::{Pod, Zeroable};

use crate::geometry::vertex::VertexDescriptor;

#[repr(C)]
#[derive(Debug, Copy, Clone, Pod, Zeroable)]
pub struct InstanceRaw {
  pub model: [[f32; 4]; 4],
  pub normal: [[f32; 3]; 3],
}

impl VertexDescriptor for InstanceRaw {
  // N by N matrix takes up N vectorN slots
  // Start at shader location 5 to avoid conflict with Vertex
  const ATTRIBUTES: &'static [wgpu::VertexAttribute] = &wgpu::vertex_attr_array![
    // Model Matrix
    5 => Float32x4,
    6 => Float32x4,
    7 => Float32x4,
    8 => Float32x4,
    // Normal Matrix
    9 => Float32x3,
    10 => Float32x3,
    11 => Float32x3
  ];
  const STEP_MODE: wgpu::VertexStepMode = wgpu::VertexStepMode::Instance;
}
