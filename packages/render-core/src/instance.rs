use bytemuck::{Pod, Zeroable};
use cgmath::{AbsDiffEq, Matrix, Matrix3, Matrix4, SquareMatrix, Zero};

use crate::geometry::vertex::VertexDescriptor;

#[repr(C)]
#[derive(Debug, Copy, Clone, Pod, Zeroable)]
pub struct InstanceRaw {
  pub model: [[f32; 4]; 4],
  pub normal: [[f32; 3]; 3],
  pub uneven_scale: u32,
}

impl InstanceRaw {
  pub fn new(model: Matrix4<f32>) -> Self {
    let linear = Matrix3::from_cols(model.x.truncate(), model.y.truncate(), model.z.truncate());

    // The inverse transpose keeps normals square to their faces under any scale, and the lighting
    // reads their length, so the scale is divided back out
    let scale = linear.determinant().abs().cbrt();

    // An uneven scale stretches some normals more than others, so the shader normalizes those.
    // Only those, since the skin's own normals aren't all unit length.
    let (normal, uneven_scale) = match linear.invert() {
      Some(inverse) => {
        let normal = inverse.transpose() * scale;
        let even = (normal.transpose() * normal).abs_diff_eq(&Matrix3::identity(), 1e-4);
        (normal, !even)
      }
      None => (Matrix3::zero(), false),
    };

    Self {
      model: model.into(),
      normal: normal.into(),
      uneven_scale: uneven_scale.into(),
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
    11 => Float32x3,
    12 => Uint32
  ];
  const STEP_MODE: wgpu::VertexStepMode = wgpu::VertexStepMode::Instance;
}
