pub mod coordinate;
pub mod vertex;

use cgmath::{Deg, Quaternion, Rad, Vector3};

use self::vertex::Vertex;

pub struct Geometry {
  pub vertices: Vec<Vertex>,
  pub indices: Vec<u32>,
}

#[derive(Copy, Clone)]
pub struct Rotation {
  pub quaternion: Quaternion<f32>,
  pub pivot: Vector3<f32>,
}

// Rust folds f32 trig (cgmath's rotations and perspective too) at build time when inlining shows
// the angle, and glibc's f32 trig can be a bit off from that. Rounded f64 trig gives one answer.
pub(crate) fn sin_cos(angle: impl Into<Rad<f32>>) -> (f32, f32) {
  let (sin, cos) = f64::from(angle.into().0).sin_cos();
  (sin as f32, cos as f32)
}

pub(crate) fn tan(angle: impl Into<Rad<f32>>) -> f32 {
  f64::from(angle.into().0).tan() as f32
}

pub fn axis_angle(axis: Vector3<f32>, angle: Deg<f32>) -> Quaternion<f32> {
  let (sin, cos) = sin_cos(Rad::from(angle) / 2.0);
  Quaternion::from_sv(cos, axis * sin)
}

impl Geometry {
  pub fn new(vertices: Vec<Vertex>, indices: Vec<u32>) -> Self {
    Self { vertices, indices }
  }

  pub fn combine(&mut self, other: Self) {
    let offset = self.vertices.len() as u32;

    self.vertices.extend(other.vertices);

    self
      .indices
      .extend(other.indices.into_iter().map(|index| index + offset));
  }

  pub fn rotate_around(&mut self, rotation: Rotation) {
    self
      .vertices
      .iter_mut()
      .for_each(|vertex| vertex.rotate_around(rotation));
  }

  pub fn translate(&mut self, offset: Vector3<f32>) {
    self.vertices.iter_mut().for_each(|vertex| {
      vertex.position = (Vector3::from(vertex.position) + offset).into();
    });
  }

  pub fn scale_around(&mut self, scale: f32, origin: Vector3<f32>) {
    self
      .vertices
      .iter_mut()
      .for_each(|vertex| vertex.scale_around(scale, origin));
  }

  // scale_around moves the normals too, which tints the lighting. The skin's flat outer
  // layer has always been drawn that way, so only new shapes use this.
  pub fn grow_around(&mut self, scale: f32, origin: Vector3<f32>) {
    self
      .vertices
      .iter_mut()
      .for_each(|vertex| vertex.grow_around(scale, origin));
  }
}
