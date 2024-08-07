use bytemuck::{Pod, Zeroable};
use cgmath::Matrix4;

use super::{Camera, CameraBehavior};

#[rustfmt::skip]
const OPENGL_TO_WGPU_MATRIX: Matrix4<f32> = Matrix4::new(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 0.5, 0.0,
    0.0, 0.0, 0.5, 1.0,
);

#[repr(C)]
#[derive(Copy, Clone, Pod, Zeroable)]
pub struct CameraUniform {
  view_position: [f32; 4],
  view_proj: [[f32; 4]; 4],
}

impl CameraUniform {
  pub fn new(camera: &Camera) -> Self {
    let mut base = Self {
      view_position: [0.0; 4],
      view_proj: [[0.0; 4]; 4],
    };

    base.update_view_projection(camera);

    base
  }

  pub fn update_view_projection(&mut self, camera: &Camera) {
    self.view_position = camera.eye().to_homogeneous().into();
    self.view_proj = (OPENGL_TO_WGPU_MATRIX * camera.view_projection_matrix()).into();
  }
}
