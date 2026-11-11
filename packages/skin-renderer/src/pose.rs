use cgmath::{Deg, Quaternion, Rotation3, Vector3, Zero};
#[cfg(not(target_arch = "wasm32"))]
use napi_derive::napi;

use crate::geometry::{Geometry, Rotation};
use crate::model::Part;

#[cfg_attr(
  not(target_arch = "wasm32"),
  napi(string_enum = "lowercase", skip_typescript)
)]
#[derive(Clone, Copy, Default, PartialEq, strum::EnumString)]
#[strum(serialize_all = "lowercase")]
pub enum Pose {
  #[default]
  Standing,
  Punch,
  Sneak,
  Jump,
  Swim,
  Fly,
}

pub struct PartPose {
  // Degrees, added to the resting angles
  pub rotation: Vector3<f32>,
  pub offset: Vector3<f32>,
}

fn part_pose(rotation: [f32; 3], offset: [f32; 3]) -> PartPose {
  PartPose {
    rotation: rotation.into(),
    offset: offset.into(),
  }
}

impl Pose {
  // Angles follow the game's own models, turned into this renderer's axes: x
  // rotations keep their sign, y and z rotations flip it
  pub fn part(self, part: Part) -> Option<PartPose> {
    let pose = match (self, part) {
      // A quarter of the way through the arm's swing, reaching forward
      (Pose::Punch, Part::RightArm) => part_pose([-79.0, 0.0, 16.0], [0.0; 3]),

      (Pose::Sneak, Part::Head) => part_pose([0.0; 3], [0.0, -1.0, 0.0]),
      (Pose::Sneak, Part::Body) => part_pose([28.6, 0.0, 0.0], [0.0; 3]),
      (Pose::Sneak, Part::RightArm | Part::LeftArm) => part_pose([22.9, 0.0, 0.0], [0.0; 3]),
      (Pose::Sneak, Part::RightLeg | Part::LeftLeg) => part_pose([0.0; 3], [0.0, 3.0, -4.0]),

      // Mid-stride, legs and arms swung opposite ways
      (Pose::Jump, Part::RightArm) => part_pose([-34.0, 0.0, 0.0], [0.0; 3]),
      (Pose::Jump, Part::LeftArm) => part_pose([34.0, 0.0, 0.0], [0.0; 3]),
      (Pose::Jump, Part::RightLeg) => part_pose([48.0, 0.0, 0.0], [0.0; 3]),
      (Pose::Jump, Part::LeftLeg) => part_pose([-48.0, 0.0, 0.0], [0.0; 3]),

      // Lying face down, so the head tips back to look ahead
      (Pose::Swim | Pose::Fly, Part::Head) => part_pose([-75.0, 0.0, 0.0], [0.0; 3]),
      (Pose::Swim, Part::RightArm) => part_pose([180.0, 0.0, 14.0], [0.0; 3]),
      (Pose::Swim, Part::LeftArm) => part_pose([180.0, 0.0, -14.0], [0.0; 3]),
      (Pose::Swim, Part::RightLeg) => part_pose([10.0, 0.0, 0.0], [0.0; 3]),
      (Pose::Swim, Part::LeftLeg) => part_pose([-10.0, 0.0, 0.0], [0.0; 3]),

      (Pose::Fly, Part::RightArm) => part_pose([0.0, 0.0, -10.0], [0.0; 3]),
      (Pose::Fly, Part::LeftArm) => part_pose([0.0, 0.0, 10.0], [0.0; 3]),

      _ => return None,
    };

    Some(pose)
  }

  // Extra swing of the cape away from the back, and where it moves to
  pub fn cape(self) -> (f32, Vector3<f32>) {
    match self {
      // The game drops a sneaking cape 2.27 but leaves out the body's 3.2, which place() adds
      Pose::Sneak => (25.0, Vector3::new(0.0, 3.2 - 2.27, 0.28)),
      Pose::Jump => (25.0, Vector3::zero()),
      _ => (0.0, Vector3::zero()),
    }
  }

  pub fn camera_radius(self) -> Option<f32> {
    match self {
      Pose::Swim | Pose::Fly => Some(100.0),
      _ => None,
    }
  }

  // Moves and turns the whole model, after each part is in place
  pub fn place(self, geometry: &mut Geometry) {
    match self {
      Pose::Sneak => geometry.translate(Vector3::new(0.0, -3.2, 0.0)),
      Pose::Jump => geometry.translate(Vector3::new(0.0, 4.0, 0.0)),
      Pose::Swim | Pose::Fly => geometry.rotate_around(Rotation {
        quaternion: Quaternion::from_angle_x(Deg(90.0)),
        pivot: Vector3::zero(),
      }),
      Pose::Standing | Pose::Punch => {}
    }
  }
}
