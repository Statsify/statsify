use cgmath::{Deg, ElementWise, Matrix3, SquareMatrix, Vector3, Zero};

use crate::display::Display;
use crate::model::{Axis, Direction, Element, ElementRotation, Model};
use crate::{Error, Pack};

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vertex {
  pub position: [f32; 3],
  pub uv: [f32; 2],
  pub normal: [f32; 3],
}

/// The faces of a model that sample one texture.
#[derive(Clone, Debug, PartialEq)]
pub struct Submesh {
  /// Texture name as the pack keys it, such as `blocks/stone`.
  pub texture: String,
  /// Whether the faces take directional shading; elements opt out with `"shade": false`.
  pub shade: bool,
  pub vertices: Vec<Vertex>,
  pub indices: Vec<u32>,
}

#[derive(Clone, Debug, PartialEq)]
pub struct BakedModel {
  pub submeshes: Vec<Submesh>,
  pub display: Display,
}

// The side of the element a corner sits on, as an index into [from, to]
const W: usize = 0;
const E: usize = 1;
const D: usize = 0;
const U: usize = 1;
const N: usize = 0;
const S: usize = 1;

// FaceBakery's corner order for each face, in `Direction` order. Every face winds counter-clockwise
// seen from outside, starting at the top left of its texture.
const CORNERS: [[[usize; 3]; 4]; 6] = [
  [[W, D, S], [W, D, N], [E, D, N], [E, D, S]],
  [[W, U, N], [W, U, S], [E, U, S], [E, U, N]],
  [[E, U, N], [E, D, N], [W, D, N], [W, U, N]],
  [[W, U, S], [W, D, S], [E, D, S], [E, U, S]],
  [[W, U, N], [W, D, N], [W, D, S], [W, U, S]],
  [[E, U, S], [E, D, S], [E, D, N], [E, U, N]],
];

const NORMALS: [[f32; 3]; 6] = [
  [0.0, -1.0, 0.0],
  [0.0, 1.0, 0.0],
  [0.0, 0.0, -1.0],
  [0.0, 0.0, 1.0],
  [-1.0, 0.0, 0.0],
  [1.0, 0.0, 0.0],
];

/// Bakes a model and its supplied parents into one submesh per texture and shade flag.
pub fn bake_model(pack: &Pack, name: &str) -> Result<BakedModel, Error> {
  let model = Model::load(pack, name)?;
  let mut submeshes: Vec<Submesh> = Vec::new();

  for element in model.elements() {
    let rotation = PartRotation::new(element.rotation.as_ref());
    let bounds = [element.from, element.to];

    for face in &element.faces {
      // 1.8 draws an undefined variable with its missing-texture checker; skip the face instead
      let Some(texture) = model.resolve_texture(&face.texture) else {
        continue;
      };

      let shade = element.shade;
      let existing = submeshes
        .iter()
        .position(|s| s.texture == texture && s.shade == shade);

      let index = existing.unwrap_or_else(|| {
        submeshes.push(Submesh {
          texture,
          shade,
          vertices: Vec::new(),
          indices: Vec::new(),
        });

        submeshes.len() - 1
      });

      let submesh = &mut submeshes[index];
      let direction = face.direction as usize;
      let uv = face
        .uv
        .unwrap_or_else(|| default_uv(face.direction, element));
      let [u0, v0, u1, v1] = uv.map(|c| c / 16.0);
      let normal = rotation.matrix * Vector3::from(NORMALS[direction]);
      let base = submesh.vertices.len() as u32;

      for (corner, sides) in CORNERS[direction].iter().enumerate() {
        let point = Vector3::from(std::array::from_fn(|axis| bounds[sides[axis]][axis]));
        let position = rotation.apply(point) / 16.0 - Vector3::new(0.5, 0.5, 0.5);

        // BlockFaceUV: corners 0 to 3 take (u0, v0), (u0, v1), (u1, v1) and (u1, v0), shifted
        // by the face rotation
        let uv = match (corner + face.quarter_turns) % 4 {
          0 => [u0, v0],
          1 => [u0, v1],
          2 => [u1, v1],
          _ => [u1, v0],
        };

        submesh.vertices.push(Vertex {
          position: position.into(),
          uv,
          normal: normal.into(),
        });
      }

      submesh.indices.extend([0, 1, 2, 0, 2, 3].map(|i| base + i));
    }
  }

  Ok(BakedModel {
    submeshes,
    display: model.display(),
  })
}

/// 1.8's `BlockPart` default uv, in model units. Later versions changed down, north and east.
fn default_uv(direction: Direction, element: &Element) -> [f32; 4] {
  let [x0, y0, z0] = element.from;
  let [x1, y1, z1] = element.to;

  match direction {
    Direction::Down | Direction::Up => [x0, z0, x1, z1],
    Direction::North | Direction::South => [x0, 16.0 - y1, x1, 16.0 - y0],
    Direction::West | Direction::East => [z0, 16.0 - y1, z1, 16.0 - y0],
  }
}

/// FaceBakery's `rotatePart` for one element.
struct PartRotation {
  matrix: Matrix3<f32>,
  origin: Vector3<f32>,
  scale: Vector3<f32>,
}

impl PartRotation {
  fn new(rotation: Option<&ElementRotation>) -> Self {
    let Some(rotation) = rotation else {
      return Self {
        matrix: Matrix3::identity(),
        origin: Vector3::zero(),
        scale: Vector3::new(1.0, 1.0, 1.0),
      };
    };

    let angle = Deg(rotation.angle);

    let matrix = match rotation.axis {
      Axis::X => Matrix3::from_angle_x(angle),
      Axis::Y => Matrix3::from_angle_y(angle),
      Axis::Z => Matrix3::from_angle_z(angle),
    };

    // `rescale` stretches the two axes across the turn so a rotated face spans the block again. 1.8
    // checks only for 22.5 degrees: every other angle, 0 included, gets the 45-degree factor.
    let stretch = match (rotation.rescale, rotation.angle.abs() == 22.5) {
      (false, _) => 1.0,
      (true, true) => 1.0 / 22.5f32.to_radians().cos(),
      (true, false) => 1.0 / 45f32.to_radians().cos(),
    };

    let scale = match rotation.axis {
      Axis::X => Vector3::new(1.0, stretch, stretch),
      Axis::Y => Vector3::new(stretch, 1.0, stretch),
      Axis::Z => Vector3::new(stretch, stretch, 1.0),
    };

    Self {
      matrix,
      origin: Vector3::from(rotation.origin),
      scale,
    }
  }

  fn apply(&self, point: Vector3<f32>) -> Vector3<f32> {
    (self.matrix * (point - self.origin)).mul_element_wise(self.scale) + self.origin
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::Transform;

  fn pack(models: &[(&str, &str)]) -> Pack {
    Pack {
      models: models
        .iter()
        .map(|(name, json)| (name.to_string(), json.to_string()))
        .collect(),
      ..Pack::default()
    }
  }

  /// Bakes one element and returns its vertices with positions and uvs back in model units.
  fn bake_element(element: &str) -> Vec<Vertex> {
    let json =
      format!(r##"{{ "textures": {{ "all": "blocks/test" }}, "elements": [{element}] }}"##);
    let model = bake_model(&pack(&[("block/test", &json)]), "block/test").unwrap();

    model.submeshes[0]
      .vertices
      .iter()
      .map(|vertex| Vertex {
        position: vertex.position.map(|c| (c + 0.5) * 16.0),
        uv: vertex.uv.map(|c| c * 16.0),
        normal: vertex.normal,
      })
      .collect()
  }

  fn assert_close<const N: usize>(actual: [f32; N], expected: [f32; N]) {
    let close = actual
      .iter()
      .zip(expected)
      .all(|(a, e)| (a - e).abs() < 1e-3);
    assert!(close, "{actual:?} != {expected:?}");
  }

  /// The last corner of a down face, (16, 8, 16), turned about (8, 8, 8).
  fn turned_corner(axis: &str, angle: f32, rescale: bool) -> Vertex {
    let vertices = bake_element(&format!(
      r##"{{
        "from": [8, 8, 8], "to": [16, 16, 16],
        "rotation": {{ "origin": [8, 8, 8], "axis": "{axis}", "angle": {angle}, "rescale": {rescale} }},
        "faces": {{ "down": {{ "texture": "#all" }} }}
      }}"##
    ));

    vertices[3]
  }

  #[test]
  fn rotates_elements_about_their_origin() {
    // Worked by hand with cos 22.5 = 0.92388, sin 22.5 = 0.38268 and cos 45 = sin 45 = 0.70711.
    // Rescaling stretches the two turning axes by 1 / cos.
    let cases = [
      ("z", 22.5, false, [15.391, 11.061, 16.0]),
      ("z", 22.5, true, [16.0, 11.314, 16.0]),
      ("y", 45.0, false, [19.314, 8.0, 8.0]),
      ("y", 45.0, true, [24.0, 8.0, 8.0]),
      ("x", -22.5, false, [16.0, 11.061, 15.391]),
      ("x", 45.0, true, [16.0, 0.0, 16.0]),
    ];

    for (axis, angle, rescale, position) in cases {
      assert_close(turned_corner(axis, angle, rescale).position, position);
    }

    // Normals turn with the element and ignore the stretch
    assert_close(turned_corner("z", 22.5, true).normal, [0.383, -0.924, 0.0]);
    assert_close(
      turned_corner("x", -22.5, false).normal,
      [0.0, -0.924, 0.383],
    );
  }

  #[test]
  fn turns_and_mirrors_face_uvs() {
    // The south face seen from outside; `rotation` turns the texture clockwise
    let top_left = [0.0, 16.0, 16.0];
    let top_right = [16.0, 16.0, 16.0];
    let bottom_right = [16.0, 0.0, 16.0];
    let bottom_left = [0.0, 0.0, 16.0];

    // uv, rotation, and where texels (2, 4) and (6, 4) land
    let cases = [
      ("[2, 4, 6, 12]", 0, top_left, top_right),
      ("[2, 4, 6, 12]", 90, top_right, bottom_right),
      ("[2, 4, 6, 12]", 180, bottom_right, bottom_left),
      ("[2, 4, 6, 12]", 270, bottom_left, top_left),
      ("[6, 4, 2, 12]", 0, top_right, top_left),
      ("[2, 12, 6, 4]", 0, bottom_left, bottom_right),
    ];

    for (uv, rotation, first, second) in cases {
      let vertices = bake_element(&format!(
        r##"{{
          "from": [0, 0, 0], "to": [16, 16, 16],
          "faces": {{ "south": {{ "uv": {uv}, "rotation": {rotation}, "texture": "#all" }} }}
        }}"##
      ));

      let landing = |texel: [f32; 2]| {
        vertices
          .iter()
          .find(|vertex| vertex.uv == texel)
          .unwrap()
          .position
      };
      assert_eq!(
        (landing([2.0, 4.0]), landing([6.0, 4.0])),
        (first, second),
        "{uv} {rotation}"
      );
    }
  }

  #[test]
  fn derives_default_uvs_from_the_element_bounds() {
    let vertices = bake_element(
      r##"{
        "from": [2, 3, 4], "to": [10, 13, 15],
        "faces": {
          "up": { "texture": "#all" },
          "down": { "texture": "#all" },
          "north": { "texture": "#all" },
          "east": { "texture": "#all" }
        }
      }"##,
    );

    let expected = [
      [2.0, 4.0, 10.0, 15.0],
      [2.0, 4.0, 10.0, 15.0],
      [2.0, 3.0, 10.0, 13.0],
      [4.0, 3.0, 15.0, 13.0],
    ];

    for (face, [u0, v0, u1, v1]) in vertices.chunks(4).zip(expected) {
      assert_close(face[0].uv, [u0, v0]);
      assert_close(face[2].uv, [u1, v1]);
    }
  }

  #[test]
  fn keeps_elements_outside_the_block() {
    let json = r##"{
      "textures": { "all": "blocks/test" },
      "elements": [{
        "from": [-12.16, -3, 20], "to": [32, 2, 31.94],
        "faces": { "up": { "uv": [0, 0, 16, 16], "texture": "#all" } }
      }]
    }"##;

    let model = bake_model(&pack(&[("block/test", json)]), "block/test").unwrap();
    let up = &model.submeshes[0].vertices;

    // Blocks centered on the origin: (-12.16, 2, 20) and (32, 2, 31.94) in model units
    assert_close(up[0].position, [-1.26, -0.375, 0.75]);
    assert_close(up[2].position, [1.5, -0.375, 1.49625]);
    assert_eq!(model.submeshes[0].indices, [0, 1, 2, 0, 2, 3]);
  }

  #[test]
  fn resolves_parents_and_texture_variables() {
    let pack = pack(&[
      (
        "block/base",
        r##"{
          "parent": "block/cube",
          "textures": { "particle": "#side", "side": "blocks/base_side", "top": "blocks/base_top" },
          "elements": [{
            "from": [0, 0, 0], "to": [16, 16, 16],
            "faces": {
              "up": { "texture": "#top" },
              "north": { "texture": "#side" },
              "south": { "texture": "#particle" },
              "east": { "texture": "#undefined" }
            }
          }],
          "display": { "head": { "scale": [2, 2, 2] }, "gui": { "rotation": [30, 45, 0] } }
        }"##,
      ),
      (
        "item/child",
        r##"{
          "parent": "minecraft:block/base",
          "textures": { "side": "minecraft:items/child_side" },
          "display": { "gui": { "translation": [0, 1, 0] } }
        }"##,
      ),
      ("block/loop_a", r#"{ "parent": "block/loop_b" }"#),
      ("block/loop_b", r#"{ "parent": "block/loop_a" }"#),
    ]);

    let model = bake_model(&pack, "item/child").unwrap();

    let faces: Vec<_> = model
      .submeshes
      .iter()
      .map(|submesh| (submesh.texture.as_str(), submesh.vertices.len() / 4))
      .collect();

    // `particle` resolves `#side` from the child, the undefined variable's face is dropped, and the
    // chain ends at block/cube, which the pack doesn't supply
    assert_eq!(faces, [("blocks/base_top", 1), ("items/child_side", 2)]);
    assert_eq!(model.display.head.unwrap().scale, [2.0; 3]);

    let gui = Transform {
      translation: [0.0, 1.0, 0.0],
      ..Transform::default()
    };

    assert_eq!(model.display.gui, Some(gui));
    assert!(matches!(
      bake_model(&pack, "block/missing"),
      Err(Error::MissingModel(_))
    ));
    assert!(matches!(
      bake_model(&pack, "block/loop_a"),
      Err(Error::InvalidModel { .. })
    ));
  }
}
