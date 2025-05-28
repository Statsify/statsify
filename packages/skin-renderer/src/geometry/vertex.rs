use std::mem::size_of;

use bytemuck::{Pod, Zeroable};
use cgmath::{Rotation as _, Vector3};

use super::Rotation;

pub trait VertexDescriptor: Sized {
  const ATTRIBUTES: &'static [wgpu::VertexAttribute];
  const STEP_MODE: wgpu::VertexStepMode;

  fn descriptor<'a>() -> wgpu::VertexBufferLayout<'a> {
    wgpu::VertexBufferLayout {
      array_stride: size_of::<Self>() as wgpu::BufferAddress,
      step_mode: Self::STEP_MODE,
      attributes: Self::ATTRIBUTES,
    }
  }
}

#[repr(C)]
#[derive(Copy, Clone, Debug, Pod, Zeroable)]
pub struct Vertex {
  pub position: [f32; 3],
  pub textures: [f32; 2],
  pub normals: [f32; 3],
}

impl Vertex {
  pub fn new(
    position: impl Into<[f32; 3]>,
    textures: impl Into<[f32; 2]>,
    normals: impl Into<[f32; 3]>,
  ) -> Self {
    Self {
      position: position.into(),
      textures: textures.into(),
      normals: normals.into(),
    }
  }

  pub fn rotate_around(&mut self, rotation: Rotation) {
    let position: Vector3<f32> = self.position.into();

    self.position =
      (rotation.quaternion.rotate_vector(position - rotation.pivot) + rotation.pivot).into();

    self.normals = rotation
      .quaternion
      .rotate_vector(self.normals.into())
      .into();
  }

  pub fn scale_around(&mut self, scale: f32, origin: Vector3<f32>) {
    let position: Vector3<f32> = self.position.into();
    self.position = (scale * position - (scale - 1.0) * origin).into();

    let normals: Vector3<f32> = self.normals.into();
    self.normals = (scale * normals - (scale - 1.0) * origin).into();
  }
}

impl VertexDescriptor for Vertex {
  const ATTRIBUTES: &'static [wgpu::VertexAttribute] = &wgpu::vertex_attr_array![
    // Position
    0 => Float32x3,
    // Textures
    1 => Float32x2,
    // Normals
    2 => Float32x3
  ];
  const STEP_MODE: wgpu::VertexStepMode = wgpu::VertexStepMode::Vertex;
}
