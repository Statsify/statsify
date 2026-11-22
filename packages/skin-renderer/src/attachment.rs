use cgmath::{Deg, Matrix4, SquareMatrix, Vector3};
use napi_derive::napi;
use statsify_minecraft_models::{Display, Transform};

use crate::geometry::axis_angle;
use crate::model::{ModelKind, Part};
use crate::pose::{Held, Pose};

const PIXELS_PER_BLOCK: f32 = 16.0;

// Where the game draws a held item from: below the shoulder joint, at the hand. 1.8 starts a pixel
// out from its arm pivot, at the middle of a classic arm, where this renderer's joint is.
const HAND: Vector3<f32> = Vector3::new(0.0, -7.0, -1.0);

// 1.8 hangs a slim arm half a pixel in and down from this renderer's joint, and turns its held
// item from a pixel further in. For the right arm.
const SLIM_HAND_PIVOT: Vector3<f32> = Vector3::new(1.5, -0.5, 0.0);
const SLIM_HAND: Vector3<f32> = Vector3::new(-1.0, -7.0, -1.0);

// The game moves a sneaking player's held item 0.203125 blocks down the hand
const SNEAKING_HAND_DROP: Vector3<f32> = Vector3::new(0.0, -3.25, 0.0);

// The game draws a player at 0.9375 of the size it draws other entities, and this renderer draws
// the player at a pixel per model unit, so other entities grow by the inverse around the feet
const PLAYER_SCALE: f32 = 0.9375;

// An entity's model origin, this renderer's neck, is drawn 1.5078125 blocks above its feet
const FEET: Vector3<f32> = Vector3::new(0.0, 7.0 - 1.5078125 * PIXELS_PER_BLOCK, 0.0);

// An armor stand hangs its head a pixel below a player's
const STAND_HEAD_DROP: Vector3<f32> = Vector3::new(0.0, -1.0, 0.0);

#[napi(string_enum = "camelCase", skip_typescript)]
#[derive(Clone, Copy, PartialEq)]
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

impl DisplayContext {
  pub fn entry(self, display: &Display) -> Option<Transform> {
    match self {
      DisplayContext::Head => display.head,
      DisplayContext::Thirdperson => display.thirdperson,
    }
  }
}

pub struct Wearer {
  pub arm_width: f32,
  pub pose: Pose,
  pub held: Held,
}

pub fn bone_transform(bone: Bone, wearer: &Wearer) -> Matrix4<f32> {
  let pose = wearer.pose;
  let joint = |part: Part| part.joint(wearer.arm_width, pose, wearer.held);

  let hand = |arm: Part| {
    let shift = |offset: Vector3<f32>| match arm {
      Part::RightArm => Matrix4::from_translation(offset),
      _ => Matrix4::from_translation(Vector3::new(-offset.x, offset.y, offset.z)),
    };

    let held = if wearer.arm_width == ModelKind::Slim.arm_width() {
      shift(SLIM_HAND_PIVOT) * joint(arm) * shift(SLIM_HAND)
    } else {
      joint(arm) * shift(HAND)
    };

    // A sneaking player's held item misses the body's drop, which the game makes up for down the
    // hand instead
    match pose {
      Pose::Sneak => held * Matrix4::from_translation(SNEAKING_HAND_DROP),
      _ => pose.placement() * held,
    }
  };

  match bone {
    Bone::Root => Matrix4::identity(),
    // The game drops a sneaking player's head item with the body, before the head's joint
    Bone::Head => pose.placement() * joint(Part::Head),
    Bone::RightHand => hand(Part::RightArm),
    Bone::LeftHand => hand(Part::LeftArm),
  }
}

// The game only wears items on entities, so a root model with a display context is worn by an
// invisible, unposed armor stand standing where the player stands
pub fn root_transform(display: Option<DisplayContext>) -> Matrix4<f32> {
  let standing = Wearer {
    arm_width: ModelKind::Classic.arm_width(),
    pose: Pose::Standing,
    held: Held::default(),
  };

  let stand = Matrix4::from_translation(FEET)
    * Matrix4::from_scale(1.0 / PLAYER_SCALE)
    * Matrix4::from_translation(-FEET);

  match display {
    None => Matrix4::identity(),
    Some(DisplayContext::Head) => {
      stand * Matrix4::from_translation(STAND_HEAD_DROP) * bone_transform(Bone::Head, &standing)
    }
    Some(DisplayContext::Thirdperson) => stand * bone_transform(Bone::RightHand, &standing),
  }
}

// The game's chain from a bone to a worn or held item baked in blocks. Its entity models have
// y down and z back, so each chain is turned into this renderer's axes.
pub fn item_transform(display: Option<DisplayContext>, model: &Display) -> Matrix4<f32> {
  let Some(context) = display else {
    return Matrix4::from_scale(PIXELS_PER_BLOCK);
  };

  // The item renderer doubles every worn or held item, applies its display entry, then
  // halves it around its center
  let entry = context
    .entry(model)
    .map_or(Matrix4::identity(), |entry| Matrix4::from(entry.matrix()));
  let worn = Matrix4::from_scale(2.0) * entry * Matrix4::from_scale(0.5);

  match context {
    // The game moves a worn item from the neck to the middle of the head, turns it to face
    // forward and draws a block 0.625 blocks wide
    DisplayContext::Head => {
      Matrix4::from_translation(Vector3::new(0.0, 4.0, 0.0))
        * Matrix4::from(axis_angle(Vector3::unit_y(), Deg(180.0)))
        * Matrix4::from_scale(0.625 * PIXELS_PER_BLOCK)
        * worn
    }
    DisplayContext::Thirdperson => {
      Matrix4::from(axis_angle(Vector3::unit_x(), Deg(180.0)))
        * Matrix4::from_scale(PIXELS_PER_BLOCK)
        * worn
    }
  }
}

// In pixels, applied like a display entry: scale, then turn about z, x and y, then move
pub fn local_transform(translation: [f32; 3], rotation: [f32; 3], scale: [f32; 3]) -> Matrix4<f32> {
  let [x, y, z] = rotation;

  Matrix4::from_translation(Vector3::from(translation))
    * Matrix4::from(
      axis_angle(Vector3::unit_y(), Deg(y))
        * axis_angle(Vector3::unit_x(), Deg(x))
        * axis_angle(Vector3::unit_z(), Deg(z)),
    )
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
      held: Held::default(),
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

    // On the player's head that's (0, 12.25, 3.125). A stand's head is a pixel lower, and the
    // stand is 16/15 the player's size around the feet at -17.125.
    assert_close(place(root, kart, [0.0; 3]), [0.0, 13.142, 3.333]);
    assert_close(place(root, kart, [0.5, 0.5, -0.5]), [-9.6, 22.742, 12.933]);
  }

  #[test]
  fn puts_bones_where_a_posed_player_holds_them() {
    let right = Held {
      right: true,
      left: false,
    };

    let seated = Wearer {
      arm_width: 4.0,
      pose: Pose::Sit,
      held: right,
    };

    let origin = [0.0; 3];

    assert_close(
      bone_transform(Bone::Head, &seated).transform_point(origin.into()),
      [0.0, 7.0, 0.0],
    );

    // The arms reach 36 degrees forward and lean 7 degrees out from the shoulders at (±6, 5, 0).
    // Holding halves the rider's 36 before adding its own 18, so both arms match.
    assert_close(
      bone_transform(Bone::RightHand, &seated).transform_point(origin.into()),
      [-6.762, -1.204, 3.305],
    );

    assert_close(
      bone_transform(Bone::LeftHand, &seated).transform_point(origin.into()),
      [6.762, -1.204, 3.305],
    );

    let standing = Wearer {
      arm_width: 4.0,
      pose: Pose::Standing,
      held: right,
    };

    // A holding arm pitches 18 degrees forward
    assert_close(
      bone_transform(Bone::RightHand, &standing).transform_point(origin.into()),
      [-6.849, -1.914, 1.212],
    );

    assert_close(
      bone_transform(Bone::LeftHand, &standing).transform_point(origin.into()),
      [6.853, -1.948, -1.0],
    );

    // A slim arm turns its item about (-4, 4.5, 0) and steps (-1, -7, -1) from there
    let slim = Wearer {
      arm_width: 3.0,
      ..standing
    };

    assert_close(
      bone_transform(Bone::RightHand, &slim).transform_point(origin.into()),
      [-5.842, -2.293, 1.212],
    );

    assert_close(
      bone_transform(Bone::LeftHand, &slim).transform_point(origin.into()),
      [5.846, -2.326, -1.0],
    );

    let sneaking = Wearer {
      arm_width: 4.0,
      pose: Pose::Sneak,
      held: right,
    };

    // The head item drops 3.2 with the body, and the head's joint one more
    assert_close(
      bone_transform(Bone::Head, &sneaking).transform_point(origin.into()),
      [0.0, 2.8, 0.0],
    );

    // A held item skips the body's drop for 3.25 down the hand, which sneaking swings 22.9
    // degrees back and holding 18 forward
    assert_close(
      bone_transform(Bone::RightHand, &sneaking).transform_point(origin.into()),
      [-7.234, -5.052, -1.872],
    );
  }
}
