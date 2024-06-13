mod orbital;
mod uniform;

use cgmath::{Matrix4, Point3};

pub use self::orbital::OrbitalCamera;
pub use self::uniform::CameraUniform;
use super::geometry::coordinate::Coordinate;

pub enum Camera {
  Orbital(OrbitalCamera),
}

impl Camera {
  fn inner(&self) -> &impl CameraBehavior {
    match self {
      Camera::Orbital(camera) => camera,
    }
  }

  fn inner_mut(&mut self) -> &mut impl CameraBehavior {
    match self {
      Camera::Orbital(camera) => camera,
    }
  }
}

pub trait CameraBehavior {
  fn eye(&self) -> Point3<f32>;
  fn view_projection_matrix(&self) -> Matrix4<f32>;

  fn process_mouse_movement(&mut self, delta: Coordinate<f64>);
  fn process_mouse_scroll(&mut self, delta: f32);
}

impl CameraBehavior for Camera {
  fn eye(&self) -> Point3<f32> {
    self.inner().eye()
  }

  fn view_projection_matrix(&self) -> Matrix4<f32> {
    self.inner().view_projection_matrix()
  }

  fn process_mouse_movement(&mut self, delta: Coordinate<f64>) {
    self.inner_mut().process_mouse_movement(delta);
  }

  fn process_mouse_scroll(&mut self, delta: f32) {
    self.inner_mut().process_mouse_scroll(delta);
  }
}
