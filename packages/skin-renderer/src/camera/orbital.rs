use cgmath::{perspective, Deg, Matrix4, Point3, Vector3};

use super::CameraBehavior;
use crate::geometry::coordinate::Coordinate;

const TWO_PI: f32 = std::f32::consts::PI * 2.0;

#[derive(Debug)]
pub struct OrbitalCamera {
  target: Point3<f32>,

  width: f32,
  height: f32,

  // spherical coordinates
  radius: f32,
  // Horizontal angle
  theta: f32,
  // Vertical angle
  phi: f32,

  // How far you can zoom in and out
  min_radius: f32,
  max_radius: f32,

  // How far you can orbit horizontally
  // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min
  // < 2 PI )
  min_polar_angle: f32,
  max_polar_angle: f32,

  // How far you can orbit verticaly, upper and lower limits.
  // Range is 0 to Math.PI radians.
  min_azimuth_angle: f32,
  max_azimuth_angle: f32,

  fovy: f32,
  znear: f32,
  zfar: f32,

  sensitivity: f32,
  zoom_sensitivity: f32,
}

impl OrbitalCamera {
  pub fn new(target: Point3<f32>, width: f32, height: f32) -> Self {
    Self {
      target,

      width,
      height,

      min_radius: 50.0,
      max_radius: 100.0,

      radius: 50.0,
      theta: -0.3,
      phi: 1.383,

      min_polar_angle: f32::NEG_INFINITY,
      max_polar_angle: f32::INFINITY,

      min_azimuth_angle: f32::EPSILON,
      max_azimuth_angle: std::f32::consts::PI - f32::EPSILON,

      fovy: 40.0,
      znear: 0.1,
      zfar: 1000.0,

      sensitivity: 1.0,
      zoom_sensitivity: 0.1,
    }
  }

  fn update_radius(&mut self, radius: f32) {
    self.radius = radius.clamp(self.min_radius, self.max_radius);
  }

  fn update_theta(&mut self, theta: f32) {
    self.theta = theta.clamp(self.min_polar_angle, self.max_polar_angle);
  }

  fn update_phi(&mut self, phi: f32) {
    self.phi = phi.clamp(self.min_azimuth_angle, self.max_azimuth_angle);
  }
}

impl CameraBehavior for OrbitalCamera {
  fn eye(&self) -> Point3<f32> {
    let x = self.radius * self.phi.sin() * self.theta.sin();
    let y = self.radius * self.phi.cos();
    let z = self.radius * self.phi.sin() * self.theta.cos();

    Point3::new(x, y, z)
  }

  fn view_projection_matrix(&self) -> Matrix4<f32> {
    let eye = self.eye();
    let view = Matrix4::look_at_rh(eye, self.target, Vector3::unit_y());

    let proj = perspective(
      Deg(self.fovy),
      self.width / self.height,
      self.znear,
      self.zfar,
    );

    proj * view
  }

  fn process_mouse_movement(&mut self, delta: Coordinate<f64>) {
    let (dx, dy) = (delta.0 as f32, delta.1 as f32);

    let dtheta = TWO_PI * dx * self.sensitivity / self.height;
    let dphi = TWO_PI * dy * self.sensitivity / self.height;

    self.update_theta(self.theta - dtheta);
    self.update_phi(self.phi - dphi);
  }

  fn process_mouse_scroll(&mut self, delta: f32) {
    self.update_radius(self.radius - (delta * self.zoom_sensitivity));
  }
}
