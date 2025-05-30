use bytemuck::{Pod, Zeroable};

use crate::camera::{Camera, CameraBehavior};

// Uniforms require 16 byte spacing so we use padding fields
#[repr(C)]
#[derive(Debug, Copy, Clone, Pod, Zeroable)]
pub struct LightUniform {
  pub position: [f32; 3],
  _padding: u32,

  pub color: [f32; 3],
  _padding2: u32,
}

impl LightUniform {
  pub fn new(position: [f32; 3], color: [f32; 3]) -> Self {
    Self {
      position,
      color,
      _padding: 0,
      _padding2: 0,
    }
  }

  pub fn update_position(&mut self, position: [f32; 3]) {
    self.position = position;
  }
}

impl From<&Camera> for LightUniform {
  fn from(camera: &Camera) -> Self {
    Self::new(camera.eye().into(), [1.0, 1.0, 1.0])
  }
}
