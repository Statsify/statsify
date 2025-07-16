use cgmath::Vector3;
use strum::EnumIter;

#[derive(EnumIter, Debug, PartialEq, Clone, Copy)]
pub(super) enum Orientation {
  Left,
  Right,
  Bottom,
  Top,
  Back,
  Front,
}

impl Orientation {
  pub fn direction(&self) -> Vector3<f32> {
    let unsigned_direction = match self {
      Orientation::Left | Orientation::Right => Vector3::unit_x(),
      Orientation::Top | Orientation::Bottom => Vector3::unit_y(),
      Orientation::Front | Orientation::Back => Vector3::unit_z(),
    };

    unsigned_direction * self.sign()
  }

  pub fn sign(&self) -> f32 {
    match self {
      Orientation::Top | Orientation::Front | Orientation::Right => 1.0,
      Orientation::Bottom | Orientation::Back | Orientation::Left => -1.0,
    }
  }
}

pub(super) trait Vector3Ext<S> {
  fn component(&self, orientation: &Orientation) -> S;
  fn set_component(&mut self, orientation: &Orientation, value: S);
}

impl<S: Copy> Vector3Ext<S> for Vector3<S> {
  fn component(&self, orientation: &Orientation) -> S {
    match orientation {
      Orientation::Top | Orientation::Bottom => self.y,
      Orientation::Front | Orientation::Back => self.z,
      Orientation::Left | Orientation::Right => self.x,
    }
  }

  fn set_component(&mut self, orientation: &Orientation, value: S) {
    match orientation {
      Orientation::Top | Orientation::Bottom => self.y = value,
      Orientation::Front | Orientation::Back => self.z = value,
      Orientation::Left | Orientation::Right => self.x = value,
    }
  }
}
