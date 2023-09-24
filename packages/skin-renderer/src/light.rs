#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct LightUniform {
  position: [f32; 3],
  // Due to uniforms requiring 16 byte (4 float) spacing, we need to use a padding field here
  _padding: u32,

  color: [f32; 3],
  // Due to uniforms requiring 16 byte (4 float) spacing, we need to use a padding field here
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
}

impl Default for LightUniform {
  fn default() -> Self {
    LightUniform::new([0.0, 50.0, 310.0], [1.0, 1.0, 1.0])
  }
}
