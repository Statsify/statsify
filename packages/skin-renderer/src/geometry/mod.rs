mod box_geometry;
pub mod coordinate;
mod orientation;
mod outer_layer_geometry;
mod prism;
pub mod vertex;

use cgmath::{Quaternion, Vector3};

pub use self::box_geometry::*;
pub use self::outer_layer_geometry::*;
pub use self::prism::TextureRegion;
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

  pub fn scale_around(&mut self, scale: f32, origin: Vector3<f32>) {
    self
      .vertices
      .iter_mut()
      .for_each(|vertex| vertex.scale_around(scale, origin));
  }
}
