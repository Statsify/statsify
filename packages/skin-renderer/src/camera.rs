use bytemuck::{Pod, Zeroable};
use cgmath::{perspective, Deg, Matrix4, Point3, Vector3};

#[rustfmt::skip]
pub const OPENGL_TO_WGPU_MATRIX: Matrix4<f32> = Matrix4::new(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 0.5, 0.0,
    0.0, 0.0, 0.5, 1.0,
);

#[derive(Debug)]
pub struct Camera {
  eye: Point3<f32>,
  target: Point3<f32>,
  up: Vector3<f32>,
  aspect: f32,
  fovy: f32,
  znear: f32,
  zfar: f32,
}

impl Camera {
  pub fn new(width: f32, height: f32) -> Self {
    Self {
      eye: (0.0, 50.0, 310.0).into(),
      target: (0.0, 0.0, 0.0).into(),
      up: Vector3::unit_y(),
      aspect: width / height,
      fovy: 40.0,
      znear: 0.1,
      zfar: 1000.0,
    }
  }

  fn build_view_projection_matrix(&self) -> Matrix4<f32> {
    let view = Matrix4::look_at_rh(self.eye, self.target, self.up);
    let proj = perspective(Deg(self.fovy), self.aspect, self.znear, self.zfar);
    proj * view
  }
}

#[repr(C)]
#[derive(Copy, Clone, Pod, Zeroable)]
pub struct CameraUniform {
  view_position: [f32; 4],
  view_proj: [[f32; 4]; 4],
}

impl CameraUniform {
  pub fn new(camera: &Camera) -> Self {
    Self {
      view_position: camera.eye.to_homogeneous().into(),
      view_proj: (OPENGL_TO_WGPU_MATRIX * camera.build_view_projection_matrix()).into(),
    }
  }
}
