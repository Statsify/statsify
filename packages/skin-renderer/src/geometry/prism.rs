use cgmath::Vector3;

use super::coordinate::Coordinate;
use super::orientation::Orientation;
use super::vertex::Vertex;
use super::Geometry;

pub(super) trait TextureProvider {
  fn coordinates(
    &self,
    orientation: &Orientation,
    dimensions: &Vector3<f32>,
  ) -> (u32, u32, u32, u32);

  fn texture_size(&self) -> Coordinate<u32>;

  fn uvs(&self, orientation: &Orientation, dimensions: &Vector3<f32>) -> (f32, f32, f32, f32) {
    let (texture_width, texture_height) = self.texture_size();
    let (x1, y1, x2, y2) = self.coordinates(orientation, dimensions);

    (
      x1 as f32 / texture_width as f32,
      y1 as f32 / texture_height as f32,
      x2 as f32 / texture_width as f32,
      y2 as f32 / texture_height as f32,
    )
  }
}

// Describes a region of a texture that follows the prism texture layout
//         [ top  ][bottom]
// [ left ][front ][right ][ back ]
pub struct TextureRegion {
  pub location: Coordinate<u32>,
  pub texture_size: Coordinate<u32>,
}

impl TextureProvider for TextureRegion {
  fn coordinates(
    &self,
    orientation: &Orientation,
    dimensions: &Vector3<f32>,
  ) -> (u32, u32, u32, u32) {
    let (x, y) = self.location;

    let (width, height, depth) = (
      dimensions.x as u32,
      dimensions.y as u32,
      dimensions.z as u32,
    );

    match orientation {
      Orientation::Top => (x + depth, y, x + width + depth, y + depth),
      Orientation::Bottom => (x + (2 * width) + depth, y, x + depth + width, y + depth),
      Orientation::Front => (x + depth, y + depth, x + width + depth, y + height + depth),
      Orientation::Back => (
        x + width + (2 * depth),
        y + depth,
        x + (2 * width) + (2 * depth),
        y + height + depth,
      ),
      Orientation::Left => (x, y + depth, x + depth, y + depth + height),
      Orientation::Right => (
        x + depth + width,
        y + depth,
        x + width + (2 * depth),
        y + height + depth,
      ),
    }
  }

  fn texture_size(&self) -> Coordinate<u32> {
    self.texture_size
  }
}

// A singular pixel in the texture
pub struct TexturePixel {
  pub location: Coordinate<u32>,
  pub texture_size: Coordinate<u32>,
}

impl TextureProvider for TexturePixel {
  fn coordinates(&self, _: &Orientation, _: &Vector3<f32>) -> (u32, u32, u32, u32) {
    let (x, y) = self.location;
    (x, y, x + 1, y + 1)
  }

  fn texture_size(&self) -> Coordinate<u32> {
    self.texture_size
  }
}

pub(super) struct Prism {
  dimensions: Vector3<f32>,
  position: Vector3<f32>,

  top_left_front: Vector3<f32>,
  top_right_front: Vector3<f32>,
  bottom_right_front: Vector3<f32>,
  bottom_left_front: Vector3<f32>,

  top_left_back: Vector3<f32>,
  top_right_back: Vector3<f32>,
  bottom_right_back: Vector3<f32>,
  bottom_left_back: Vector3<f32>,
}

impl Prism {
  pub fn new(dimensions: Vector3<f32>, position: Vector3<f32>) -> Self {
    // Scale the prism from the center
    let half_width = dimensions.x / 2.0;
    let half_height = dimensions.y / 2.0;
    let half_depth = dimensions.z / 2.0;

    // Vertices relative to the center
    let top_left_front = Vector3::new(-half_width, half_height, half_depth) + position;
    let top_right_front = Vector3::new(half_width, half_height, half_depth) + position;
    let bottom_right_front = Vector3::new(half_width, -half_height, half_depth) + position;
    let bottom_left_front = Vector3::new(-half_width, -half_height, half_depth) + position;

    let top_left_back = Vector3::new(-half_width, half_height, -half_depth) + position;
    let top_right_back = Vector3::new(half_width, half_height, -half_depth) + position;
    let bottom_right_back = Vector3::new(half_width, -half_height, -half_depth) + position;
    let bottom_left_back = Vector3::new(-half_width, -half_height, -half_depth) + position;

    Self {
      dimensions,
      position,

      top_left_front,
      top_right_front,
      bottom_right_front,
      bottom_left_front,

      top_left_back,
      top_right_back,
      bottom_right_back,
      bottom_left_back,
    }
  }

  pub fn vertices(&self, face: &Orientation, texture_provider: &impl TextureProvider) -> Geometry {
    let vectors = match face {
      Orientation::Top => [
        self.top_left_back,
        self.top_right_back,
        self.top_right_front,
        self.top_left_front,
      ],
      Orientation::Bottom => [
        self.bottom_right_back,
        self.bottom_left_back,
        self.bottom_left_front,
        self.bottom_right_front,
      ],
      Orientation::Front => [
        self.top_left_front,
        self.top_right_front,
        self.bottom_right_front,
        self.bottom_left_front,
      ],
      Orientation::Back => [
        self.top_right_back,
        self.top_left_back,
        self.bottom_left_back,
        self.bottom_right_back,
      ],
      Orientation::Left => [
        self.top_left_back,
        self.top_left_front,
        self.bottom_left_front,
        self.bottom_left_back,
      ],
      Orientation::Right => [
        self.top_right_front,
        self.top_right_back,
        self.bottom_right_back,
        self.bottom_right_front,
      ],
    };

    let normal = face.direction();

    let (u1, v1, u2, v2) = texture_provider.uvs(face, &self.dimensions);

    let a = Vertex::new(vectors[0], [u1, v1], normal);
    let b = Vertex::new(vectors[3], [u1, v2], normal);
    let c = Vertex::new(vectors[2], [u2, v2], normal);
    let d = Vertex::new(vectors[1], [u2, v1], normal);

    // Indice Order:
    // A -> B -> C
    // D -> A -> C

    Geometry::new(vec![a, b, c, d], vec![0, 1, 2, 0, 2, 3])
  }

  pub fn set_position(&mut self, position: Vector3<f32>) {
    let delta = position - self.position;

    self.top_left_front += delta;
    self.top_right_front += delta;
    self.bottom_right_front += delta;
    self.bottom_left_front += delta;

    self.top_left_back += delta;
    self.top_right_back += delta;
    self.bottom_right_back += delta;
    self.bottom_left_back += delta;

    self.position = position;
  }
}
