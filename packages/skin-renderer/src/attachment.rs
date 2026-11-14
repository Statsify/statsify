use cgmath::{Deg, Matrix4, SquareMatrix, Vector3};
use napi_derive::napi;
use statsify_minecraft_models::{Display, Transform};

use crate::model::{ModelKind, Part};
use crate::pose::Pose;

const PIXELS_PER_BLOCK: f32 = 16.0;

// Where the game draws a held item from: below the shoulder joint, at the hand
const HAND: Vector3<f32> = Vector3::new(0.0, -7.0, -1.0);

// LayerHeldItem moves a sneaking player's item 0.203125 blocks down the hand
const SNEAKING_HAND_DROP: Vector3<f32> = Vector3::new(0.0, -3.25, 0.0);

#[napi(string_enum = "camelCase", skip_typescript)]
#[derive(Clone, Copy)]
pub enum Bone {
  Root,
  Head,
  RightHand,
  LeftHand,
}

#[napi(string_enum = "lowercase", skip_typescript)]
#[derive(Clone, Copy)]
pub enum DisplayContext {
  Head,
  Thirdperson,
}

pub struct Wearer {
  pub arm_width: f32,
  pub pose: Pose,
}

pub fn bone_transform(bone: Bone, wearer: &Wearer) -> Matrix4<f32> {
  let pose = wearer.pose;
  let joint = |part: Part| part.joint(wearer.arm_width, pose);

  // A sneaking player's held item misses the body's drop, which LayerHeldItem makes up for down
  // the hand instead
  let hand = |arm: Part| match pose {
    Pose::Sneak => {
      joint(arm) * Matrix4::from_translation(HAND) * Matrix4::from_translation(SNEAKING_HAND_DROP)
    }
    _ => pose.placement() * joint(arm) * Matrix4::from_translation(HAND),
  };

  match bone {
    Bone::Root => Matrix4::identity(),
    // LayerCustomHead drops a sneaking player's head item with the body, before the head's joint
    Bone::Head => pose.placement() * joint(Part::Head),
    Bone::RightHand => hand(Part::RightArm),
    Bone::LeftHand => hand(Part::LeftArm),
  }
}

// The game only wears items on entities, so a root model with a display context is worn by an
// invisible, unposed one standing where the player stands, as on an armor stand
pub fn root_transform(display: Option<DisplayContext>) -> Matrix4<f32> {
  let standing = Wearer {
    arm_width: ModelKind::Classic.arm_width(),
    pose: Pose::Standing,
  };

  match display {
    None => Matrix4::identity(),
    Some(DisplayContext::Head) => bone_transform(Bone::Head, &standing),
    Some(DisplayContext::Thirdperson) => bone_transform(Bone::RightHand, &standing),
  }
}

// The game's chain from a bone to a worn or held item baked in blocks. Its entity models have
// y down and z back, so each chain is turned into this renderer's axes.
pub fn item_transform(display: Option<DisplayContext>, model: &Display) -> Matrix4<f32> {
  // The item renderer doubles every worn or held item, applies its display entry, then
  // halves it around its center
  let worn = |entry: Option<Transform>| {
    let entry = entry.map_or(Matrix4::identity(), |entry| Matrix4::from(entry.matrix()));
    Matrix4::from_scale(2.0) * entry * Matrix4::from_scale(0.5)
  };

  match display {
    None => Matrix4::from_scale(PIXELS_PER_BLOCK),
    // LayerCustomHead moves from the neck to the middle of the head, turns the item to face
    // forward and draws a block 0.625 blocks wide
    Some(DisplayContext::Head) => {
      Matrix4::from_translation(Vector3::new(0.0, 4.0, 0.0))
        * Matrix4::from_angle_y(Deg(180.0))
        * Matrix4::from_scale(0.625 * PIXELS_PER_BLOCK)
        * worn(model.head)
    }
    Some(DisplayContext::Thirdperson) => {
      Matrix4::from_angle_x(Deg(180.0))
        * Matrix4::from_scale(PIXELS_PER_BLOCK)
        * worn(model.thirdperson)
    }
  }
}

// In pixels, applied like a display entry: scale, then turn about z, x and y, then move
pub fn local_transform(translation: [f32; 3], rotation: [f32; 3], scale: [f32; 3]) -> Matrix4<f32> {
  let [x, y, z] = rotation;

  Matrix4::from_translation(Vector3::from(translation))
    * Matrix4::from_angle_y(Deg(y))
    * Matrix4::from_angle_x(Deg(x))
    * Matrix4::from_angle_z(Deg(z))
    * Matrix4::from_nonuniform_scale(scale[0], scale[1], scale[2])
}

#[cfg(test)]
mod tests {
  use cgmath::{Point3, Transform as _};

  use super::*;

  fn assert_close(actual: Point3<f32>, expected: [f32; 3]) {
    let close = (0..3).all(|axis| (actual[axis] - expected[axis]).abs() < 1e-3);
    assert!(close, "{actual:?} != {expected:?}");
  }

  fn place(bone: Matrix4<f32>, chain: Matrix4<f32>, point: [f32; 3]) -> Point3<f32> {
    (bone * chain).transform_point(Point3::from(point))
  }

  #[test]
  fn wears_models_on_the_head_like_the_game() {
    let standing = Wearer {
      arm_width: 4.0,
      pose: Pose::Standing,
    };

    let head = bone_transform(Bone::Head, &standing);

    // With no display entry a block is 10 pixels wide around the head's middle, (0, 11, 0), so
    // it overhangs the 8 pixel head by one on each side. Its north face turns to the front, +z.
    let plain = item_transform(Some(DisplayContext::Head), &Display::default());
    assert_close(place(head, plain, [0.5, 0.5, -0.5]), [-5.0, 16.0, 5.0]);

    // Scaled 1.8 and moved by (0, 1, -2.5) sixteenths, which the doubling makes twice as far
    let display = Display {
      head: Some(Transform {
        rotation: [0.0; 3],
        translation: [0.0, 1.0, -2.5],
        scale: [1.8; 3],
      }),
      ..Display::default()
    };

    let kart = item_transform(Some(DisplayContext::Head), &display);
    let root = root_transform(Some(DisplayContext::Head));

    assert_close(place(root, kart, [0.0; 3]), [0.0, 12.25, 3.125]);
    assert_close(place(root, kart, [0.5, 0.5, -0.5]), [-9.0, 21.25, 12.125]);
  }

  #[test]
  fn puts_bones_where_a_posed_player_holds_them() {
    let seated = Wearer {
      arm_width: 4.0,
      pose: Pose::Sit,
    };

    let origin = [0.0; 3];

    assert_close(
      bone_transform(Bone::Head, &seated).transform_point(origin.into()),
      [0.0, 7.0, 0.0],
    );

    // The arms reach 36 degrees forward and lean 7 degrees out from the shoulders at (±6, 5, 0)
    assert_close(
      bone_transform(Bone::RightHand, &seated).transform_point(origin.into()),
      [-6.762, -1.204, 3.305],
    );

    assert_close(
      bone_transform(Bone::LeftHand, &seated).transform_point(origin.into()),
      [6.762, -1.204, 3.305],
    );

    let sneaking = Wearer {
      arm_width: 4.0,
      pose: Pose::Sneak,
    };

    // The head item drops 3.2 with the body, and the head's joint one more
    assert_close(
      bone_transform(Bone::Head, &sneaking).transform_point(origin.into()),
      [0.0, 2.8, 0.0],
    );

    // A held item skips the body's drop for 3.25 down the hand, which swings 22.9 degrees back
    assert_close(
      bone_transform(Bone::RightHand, &sneaking).transform_point(origin.into()),
      [-7.103, -3.986, -4.910],
    );
  }
}
