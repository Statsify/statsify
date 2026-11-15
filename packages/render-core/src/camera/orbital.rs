use cgmath::{Deg, EuclideanSpace, InnerSpace, Matrix4, Point3, Rad, Vector3};

use super::CameraBehavior;
use crate::geometry::coordinate::Coordinate;
use crate::geometry::{sin_cos, tan};

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

  pub fn with_theta(mut self, theta: f32) -> Self {
    self.update_theta(theta);
    self
  }

  pub fn with_phi(mut self, phi: f32) -> Self {
    self.update_phi(phi);
    self
  }

  // A fixed render isn't bound by the viewer's zoom limits
  pub fn fitted(mut self, points: &[Vector3<f32>], radius: f32) -> Self {
    let back = self.offset().normalize();
    let right = Vector3::unit_y().cross(back).normalize();
    let up = back.cross(right);
    let tan = tan(Deg(self.fovy / 2.0));

    // The radius at which the farthest-out point sits `margin` pixels inside the frame
    let radius_for = |margin: f32| {
      let half_height = tan * (1.0 - 2.0 * margin / self.height);
      let half_width = tan * self.width / self.height * (1.0 - 2.0 * margin / self.width);

      points
        .iter()
        .map(|point| {
          let point = point - self.target.to_vec();
          let spread = (point.dot(right).abs() / half_width).max(point.dot(up).abs() / half_height);
          point.dot(back) + spread
        })
        .fold(f32::MIN, f32::max)
    };

    self.radius = if radius_for(1.0) > radius {
      radius_for(4.0)
    } else {
      radius
    };

    self
  }

  // From the target to the eye
  fn offset(&self) -> Vector3<f32> {
    let (phi_sin, phi_cos) = sin_cos(Rad(self.phi));
    let (theta_sin, theta_cos) = sin_cos(Rad(self.theta));

    let x = self.radius * phi_sin * theta_sin;
    let y = self.radius * phi_cos;
    let z = self.radius * phi_sin * theta_cos;

    Vector3::new(x, y, z)
  }

  // Slides the camera across and along its view, keeping the angle, until the points span one
  // axis of the frame less `margin` pixels on each side and sit about centered on the other.
  // `unframed` points don't move the camera but stay between the clipping planes, so only the
  // frame's edges cut them. None when the points are too small or too far out to project, or an
  // unframed one is behind the eye.
  pub fn framed(
    mut self,
    points: &[Vector3<f32>],
    unframed: &[Vector3<f32>],
    margin: f32,
  ) -> Option<Self> {
    let back = self.offset().normalize();
    let right = Vector3::unit_y().cross(back).normalize();
    let up = back.cross(right);
    let tan = tan(Deg(self.fovy / 2.0));

    let tan_y = tan * (1.0 - 2.0 * margin / self.height);
    let tan_x = tan * self.width / self.height * (1.0 - 2.0 * margin / self.width);

    // How far one side of the view has to move out along `side` to take in every point
    let reach = |side: Vector3<f32>, tan: f32| {
      points
        .iter()
        .map(|point| point.dot(side) + tan * point.dot(back))
        .fold(f32::MIN, f32::max)
    };

    let (right_reach, left_reach) = (reach(right, tan_x), reach(-right, tan_x));
    let (top_reach, bottom_reach) = (reach(up, tan_y), reach(-up, tan_y));

    let distance =
      ((right_reach + left_reach) / (2.0 * tan_x)).max((top_reach + bottom_reach) / (2.0 * tan_y));

    let eye = right * (right_reach - left_reach) / 2.0
      + up * (top_reach - bottom_reach) / 2.0
      + back * distance;

    // The target keeps its depth, so the radius stays a distance into the scene
    self.radius = (eye - self.target.to_vec()).dot(back);
    self.target = Point3::from_vec(eye - back * self.radius);

    // Points can sit at any scale, so the clipping planes leave room around the depths of every
    // point drawn instead of the fixed ones, which cut off scenes much larger or smaller than a player
    let depths = points
      .iter()
      .chain(unframed)
      .map(|point| (eye - point).dot(back));
    self.znear = depths.clone().fold(f32::MAX, f32::min) / 2.0;
    self.zfar = depths.fold(f32::MIN, f32::max) * 2.0;

    // The projection needs the near plane in front of the eye and the far plane clearly past it
    let apart = self.znear > 0.0 && self.zfar - self.znear > f32::EPSILON;
    (apart && self.view_projection_matrix().is_finite()).then_some(self)
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
    self.target + self.offset()
  }

  fn view_projection_matrix(&self) -> Matrix4<f32> {
    let eye = self.eye();
    let view = Matrix4::look_at_rh(eye, self.target, Vector3::unit_y());

    // cgmath's perspective, with the tangent from geometry::tan
    let f = tan(Deg(self.fovy / 2.0)).recip();
    let (near, far) = (self.znear, self.zfar);

    #[rustfmt::skip]
    let proj = Matrix4::new(
      f / (self.width / self.height), 0.0, 0.0, 0.0,
      0.0, f, 0.0, 0.0,
      0.0, 0.0, (far + near) / (near - far), -1.0,
      0.0, 0.0, (2.0 * far * near) / (near - far), 0.0,
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

#[cfg(test)]
mod tests {
  use cgmath::Vector4;

  use super::*;

  const WIDTH: f32 = 300.0;
  const HEIGHT: f32 = 200.0;

  fn points() -> Vec<Vector3<f32>> {
    [
      [70.0, -12.0, 25.0],
      [40.0, 3.0, 20.0],
      [28.0, -30.0, 41.0],
      [44.0, -10.0, 9.0],
    ]
    .into_iter()
    .map(Vector3::from)
    .collect()
  }

  // Pixels from the points to the left, right, bottom and top edges of the frame
  fn gaps(camera: &OrbitalCamera) -> [f32; 4] {
    let view_projection = camera.view_projection_matrix();

    points().iter().fold([f32::MAX; 4], |gaps, point| {
      let clip = view_projection * Vector4::new(point.x, point.y, point.z, 1.0);
      let (x, y) = (clip.x / clip.w, clip.y / clip.w);
      let edges = [x + 1.0, 1.0 - x, y + 1.0, 1.0 - y];
      let sizes = [WIDTH, WIDTH, HEIGHT, HEIGHT];
      std::array::from_fn(|side| gaps[side].min(edges[side] * sizes[side] / 2.0))
    })
  }

  fn camera() -> OrbitalCamera {
    OrbitalCamera::new(Point3::new(40.0, -12.0, 25.0), WIDTH, HEIGHT)
      .with_theta(0.7)
      .with_phi(1.2)
  }

  #[test]
  fn fits_points_around_its_target() {
    let camera = camera().fitted(&points(), 0.0);
    let target = Point3::new(40.0, -12.0, 25.0);
    assert!(((camera.eye() - target).magnitude() - camera.radius).abs() < 1e-3);

    // Every point is in frame, and the farthest out sits the 4 pixel margin from the edge
    let nearest = gaps(&camera).into_iter().fold(f32::MAX, f32::min);
    assert!((nearest - 4.0).abs() < 0.01, "{nearest}");
  }

  #[test]
  fn frames_points_centered() {
    let camera = camera().framed(&points(), &[], 10.0).unwrap();
    let [left, right, bottom, top] = gaps(&camera);

    // These points are taller than the frame for their width, so the top and bottom touch it
    let close = |a: f32, b: f32| (a - b).abs() < 0.01;
    assert!(close(bottom, 10.0) && close(top, 10.0), "{bottom} {top}");
    assert!(left > 10.0 && right > 10.0, "{left} {right}");
  }

  #[test]
  fn keeps_framed_points_between_the_clipping_planes() {
    for scale in [1e-4, 1.0, 100.0] {
      let points: Vec<_> = points().into_iter().map(|point| point * scale).collect();
      let target = Point3::new(40.0, -12.0, 25.0) * scale;
      let camera = OrbitalCamera::new(target, WIDTH, HEIGHT)
        .with_theta(0.7)
        .with_phi(1.2)
        .framed(&points, &[], 10.0)
        .unwrap();
      let view_projection = camera.view_projection_matrix();

      for point in &points {
        let clip = view_projection * point.extend(1.0);
        assert!(clip.z.abs() < clip.w, "{scale}: {clip:?}");
      }
    }

    let distant: Vec<_> = points().into_iter().map(|point| point * 1e30).collect();
    assert!(camera().framed(&distant, &[], 10.0).is_none());
  }

  #[test]
  fn keeps_unframed_points_out_of_the_framing_but_between_the_clipping_planes() {
    let framed = camera().framed(&points(), &[], 10.0).unwrap();
    let (eye, back) = (framed.eye().to_vec(), framed.offset().normalize());
    let depth = |point: &Vector3<f32>| (eye - point).dot(back);
    let nearest = points().iter().map(depth).fold(f32::MAX, f32::min);
    let farthest = points().iter().map(depth).fold(f32::MIN, f32::max);

    // Nearer the eye than the framed points' near plane, past their far plane, and off to the side
    let unframed = [
      eye - back * nearest / 4.0,
      eye - back * farthest * 3.0,
      points()[0] + Vector3::unit_y().cross(back).normalize() * 100.0,
    ];

    let camera = camera().framed(&points(), &unframed, 10.0).unwrap();
    assert_eq!((camera.eye(), camera.target), (framed.eye(), framed.target));

    let view_projection = camera.view_projection_matrix();

    for point in unframed {
      let clip = view_projection * point.extend(1.0);
      assert!(clip.z.abs() < clip.w, "{clip:?}");
    }
  }
}
