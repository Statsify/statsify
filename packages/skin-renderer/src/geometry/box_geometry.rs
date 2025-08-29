use cgmath::Vector3;
use strum::IntoEnumIterator;

use super::orientation::Orientation;
use super::prism::{Prism, TextureRegion};
use super::{Geometry, Rotation};

pub struct BoxGeometry {
  pub position: Vector3<f32>,
  pub dimensions: Vector3<f32>,
  pub texture_region: TextureRegion,
  pub rotation: Option<Rotation>,
}

impl BoxGeometry {
  pub fn create(self) -> Geometry {
    let mut geometry = Geometry::new(vec![], vec![]);
    let prism = Prism::new(self.dimensions, self.position);

    Orientation::iter()
      .for_each(|face| geometry.combine(prism.vertices(&face, &self.texture_region)));

    if let Some(rotation) = self.rotation {
      geometry.rotate_around(rotation);
    }

    geometry
  }
}
