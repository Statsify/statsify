use cgmath::{Deg, Quaternion, Rotation3, Vector3, Zero};
use image::{DynamicImage, GenericImageView};
use strum::IntoEnumIterator;

use super::orientation::{Orientation, Vector3Ext};
use super::prism::{Prism, TexturePixel, TextureProvider, TextureRegion};
use super::{Geometry, Rotation};

pub struct ExtrudedGeometry<'a> {
  pub dimensions: Vector3<f32>,
  pub position: Vector3<f32>,

  pub image: &'a DynamicImage,
  pub voxel: f32,

  pub texture_region: TextureRegion,

  pub rotation: Option<Rotation>,
}

impl<'a> ExtrudedGeometry<'a> {
  pub fn create(self) -> Geometry {
    let mut geometry = Geometry::new(vec![], vec![]);

    Orientation::iter().for_each(|face| geometry.combine(self.extrude_face(face)));

    if let Some(rotation) = self.rotation {
      geometry.rotate_around(rotation);
    }

    geometry
  }

  fn extrude_face(&self, face: Orientation) -> Geometry {
    let mut geometry = Geometry::new(vec![], vec![]);

    let (x1, y1, x2, y2) = self.texture_region.coordinates(&face, &self.dimensions);

    let dx = (x2 as i32 - x1 as i32).abs() as f32;
    let dy = (y2 as i32 - y1 as i32).abs() as f32;

    let (x_min, x_max) = (x1.min(x2), x1.max(x2));
    let (y_min, y_max) = (y1.min(y2), y1.max(y2));

    // TODO: back and bottom mirrored

    // Offset the position in the correct direction so each voxel is sitting on the
    // inner face
    let offset = (self.dimensions.component(&face) + self.voxel) / 2.0;
    let face_position = self.position + face.direction() * offset;

    // Create a voxel extruded in the Z direction which will be rotated to the
    // correct orientation
    let dimensions = Vector3::new(1.0, 1.0, self.voxel);
    let sign = face.sign();
    let quaternion = match face {
      Orientation::Top | Orientation::Bottom => Quaternion::from_angle_x(Deg(-90.0 * sign)),
      Orientation::Front => Quaternion::zero(),
      Orientation::Back => Quaternion::from_angle_y(Deg(180.0)),
      Orientation::Right | Orientation::Left => Quaternion::from_angle_y(Deg(90.0 * sign)),
    };

    // Use placeholder position for now which will be updated for each voxel
    let mut prism = Prism::new(dimensions, face_position, 1.0);

    for x in x_min..x_max {
      for y in y_min..y_max {
        let pixel = self.image.get_pixel(x, y);

        // Skip transparent pixels
        if pixel[3] == 0 {
          continue;
        }

        let position_x = match face {
          Orientation::Back => (dx / 2.0) - (x as f32) + (x_min as f32) - 0.5,
          _ => (x as f32) - (x_min as f32) - (dx / 2.0) + 0.5,
        };
        let position_y = (dy / 2.0) - (y as f32) + (y_min as f32) - 0.5;
        let mut position: Vector3<f32> = Vector3::new(position_x, position_y, 0.0);

        // Switch the Z position with the component of the face direction
        position.z = position.component(&face) * sign * -1.0;
        position.set_component(&face, 0.0);

        // Offset the voxel position by the face position
        position += face_position;

        prism.set_position(position);

        // Hide faces that are adjacent to another voxel
        let has_pixel_left = x > x_min && self.image.get_pixel(x - 1, y)[3] != 0;
        let has_pixel_right = x < x_max - 1 && self.image.get_pixel(x + 1, y)[3] != 0;
        let has_pixel_top = y > y_min && self.image.get_pixel(x, y - 1)[3] != 0;
        let has_pixel_bottom = y < y_max - 1 && self.image.get_pixel(x, y + 1)[3] != 0;

        let texture_pixel = TexturePixel {
          location: (x, y),
          texture_size: self.texture_region.texture_size,
        };

        Orientation::iter()
          .filter(|face| match face {
            Orientation::Front => true,
            Orientation::Back => false,
            Orientation::Left => !has_pixel_left,
            Orientation::Right => !has_pixel_right,
            Orientation::Top => !has_pixel_top,
            Orientation::Bottom => !has_pixel_bottom,
          })
          .for_each(|face| {
            let mut voxel_face = prism.vertices(&face, &texture_pixel);

            // Rotate the voxel face to the correct orientation
            voxel_face.rotate_around(Rotation {
              quaternion,
              pivot: position,
            });

            geometry.combine(voxel_face);
          });
      }
    }

    geometry
  }
}
