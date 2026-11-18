use bytemuck::{Pod, Zeroable};
use cgmath::{Deg, Matrix3, Matrix4, Quaternion, Rotation3, Vector3};

use crate::geometry::vertex::VertexDescriptor;

#[repr(C)]
#[derive(Debug, Copy, Clone, Pod, Zeroable)]
pub struct InstanceRaw {
  pub model: [[f32; 4]; 4],
  pub normal: [[f32; 3]; 3],
}

impl InstanceRaw {
  pub fn identity() -> Self {
    let position = Vector3::new(0.0, 0.0, 0.0);
    let rotation = Quaternion::from_axis_angle(Vector3::unit_y(), Deg(0.0));

    Self {
      model: (Matrix4::from_translation(position) * Matrix4::from(rotation)).into(),
      normal: Matrix3::from(rotation).into(),
    }
  }
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
