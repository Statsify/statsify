use cgmath::{Deg, Matrix4, Vector3};

/// A model's `display` transforms for the contexts scenes draw, as 1.8 names them.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Display {
  pub thirdperson: Option<Transform>,
  pub head: Option<Transform>,
}

impl Display {
  /// 1.8 takes each context from the nearest model in the parent chain that sets it to something
  /// other than the identity, compared after clamping.
  pub(crate) fn or(self, parent: Display) -> Display {
    let pick = |child: Option<Transform>, parent: Option<Transform>| match child {
      Some(transform) if !transform.is_identity() => child,
      _ => parent.or(child),
    };

    Display {
      thirdperson: pick(self.thirdperson, parent.thirdperson),
      head: pick(self.head, parent.head),
    }
  }
}

/// One `display` entry with the values as written in the model.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Transform {
  /// Degrees about x, y and z.
  pub rotation: [f32; 3],
  /// Sixteenths of a block.
  pub translation: [f32; 3],
  pub scale: [f32; 3],
}

impl Default for Transform {
  fn default() -> Self {
    Self {
      rotation: [0.0; 3],
      translation: [0.0; 3],
      scale: [1.0; 3],
    }
  }
}

impl Transform {
  /// The column-major matrix 1.8's item renderer applies, in block units. 1.8 halves the centered
  /// model before this matrix and doubles 3D items worn or held after it.
  pub fn matrix(&self) -> [[f32; 4]; 4] {
    let [x, y, z] = self.rotation;
    let (translation, [sx, sy, sz]) = self.clamped();

    let matrix = Matrix4::from_translation(Vector3::from(translation))
      * Matrix4::from_angle_y(Deg(y))
      * Matrix4::from_angle_x(Deg(x))
      * Matrix4::from_angle_z(Deg(z))
      * Matrix4::from_nonuniform_scale(sx, sy, sz);

    matrix.into()
  }

  /// Translation in blocks and scale, clamped as 1.8 clamps them when it reads a model.
  fn clamped(&self) -> ([f32; 3], [f32; 3]) {
    let translation = self.translation.map(|t| (t / 16.0).clamp(-1.5, 1.5));
    let scale = self.scale.map(|s| s.clamp(-4.0, 4.0));
    (translation, scale)
  }

  fn is_identity(&self) -> bool {
    let (translation, scale) = self.clamped();
    self.rotation == [0.0; 3] && translation == [0.0; 3] && scale == [1.0; 3]
  }
}

#[cfg(test)]
mod tests {
  use cgmath::{Matrix4, Vector4};

  use super::*;

  fn apply(transform: &Transform, point: [f32; 3]) -> [f32; 3] {
    let [x, y, z] = point;
    let moved = Matrix4::from(transform.matrix()) * Vector4::new(x, y, z, 1.0);
    [moved.x, moved.y, moved.z]
  }

  fn assert_close(actual: [f32; 3], expected: [f32; 3]) {
    let close = actual
      .iter()
      .zip(expected)
      .all(|(a, e)| (a - e).abs() < 1e-4);
    assert!(close, "{actual:?} != {expected:?}");
  }

  #[test]
  fn display_matrix_scales_then_rotates_z_x_y_then_translates() {
    let transform = Transform {
      rotation: [90.0, 90.0, 0.0],
      translation: [8.0, 0.0, 0.0],
      scale: [2.0, 1.0, 1.0],
    };

    // x: scaled to 2, unmoved by the x turn, then the y turn carries +x to -z
    assert_close(apply(&transform, [1.0, 0.0, 0.0]), [0.5, 0.0, -2.0]);
    // y: the x turn carries +y to +z, then the y turn carries +z to +x
    assert_close(apply(&transform, [0.0, 1.0, 0.0]), [1.5, 0.0, 0.0]);

    let clamped = Transform {
      translation: [40.0, -40.0, 0.0],
      scale: [9.0, 1.0, 1.0],
      ..Transform::default()
    };

    assert_close(apply(&clamped, [1.0, 0.0, 0.0]), [5.5, -1.5, 0.0]);
    let identity: [[f32; 4]; 4] = Matrix4::from_scale(1.0).into();
    assert_eq!(Transform::default().matrix(), identity);
  }
}
