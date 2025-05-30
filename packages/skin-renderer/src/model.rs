use cgmath::{Deg, Matrix3, Matrix4, Quaternion, Rotation3, Vector3, Zero};
use image::DynamicImage;

use crate::geometry::coordinate::Coordinate;
use crate::geometry::{BoxGeometry, OuterLayerGeometry, Rotation, TextureRegion};
use crate::instance::InstanceRaw;
use crate::material::Material;
use crate::mesh::{DrawMesh, Mesh};
use crate::texture::Texture;

pub enum ModelKind {
  Classic,
  Slim,
}

pub enum ModelOuterLayer {
  // Extrude outer layer (3D)
  D3,
  // Scale outer layer up (2D)
  D2,
}

const VOXEL_3D_THICKNESS: f32 = 0.75;

struct CenterRotation {
  pub quaternion: Quaternion<f32>,
  pub pivot_delta: Vector3<f32>,
}

struct BodyPart<'a> {
  pub position: Vector3<f32>,
  pub dimensions: Vector3<f32>,

  pub image: &'a DynamicImage,

  pub layer1_location: Coordinate<u32>,
  pub layer2_location: Coordinate<u32>,

  pub rotation: Option<CenterRotation>,

  pub outer_layer: &'a ModelOuterLayer,
}

impl<'a> BodyPart<'a> {
  fn create(mut self, scale: f32, device: &wgpu::Device) -> (Mesh, Mesh) {
    let texture_size = (64, 64);

    self.position.y -= 1.0;

    let rotation = self.rotation.map(|rotation| Rotation {
      quaternion: rotation.quaternion,
      pivot: self.position + rotation.pivot_delta,
    });

    let mut inner_geometry = BoxGeometry {
      position: self.position,
      dimensions: self.dimensions,
      texture_region: TextureRegion {
        location: self.layer1_location,
        texture_size,
      },
      rotation,
    }
    .create();

    let texture_region = TextureRegion {
      location: self.layer2_location,
      texture_size,
    };

    let mut outer_geometry = match self.outer_layer {
      ModelOuterLayer::D3 => OuterLayerGeometry {
        position: self.position,
        dimensions: self.dimensions,
        image: self.image,
        thickness: VOXEL_3D_THICKNESS,
        texture_region,
        rotation,
        extrude: true,
      }
      .create(),
      ModelOuterLayer::D2 => {
        let mut layer = OuterLayerGeometry {
          position: self.position,
          dimensions: self.dimensions,
          image: self.image,
          thickness: 0.001,
          texture_region,
          rotation,
          extrude: false,
        }
        .create();
        // In Minecraft the outer layer is scaled up 12.5%
        layer.scale_around(1.125, self.position);
        layer
      }
    };

    inner_geometry.scale_around(scale, self.position);
    outer_geometry.scale_around(scale, self.position);

    (
      Mesh::from_geometry(device, inner_geometry),
      Mesh::from_geometry(device, outer_geometry),
    )
  }
}

pub struct Model {
  material: Material,
  meshes: Vec<Mesh>,
}

impl Model {
  pub fn new(
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    layout: &wgpu::BindGroupLayout,
    image: DynamicImage,
    kind: ModelKind,
    outer_layer: ModelOuterLayer,
  ) -> Self {
    let outer_layer = &outer_layer;

    let head = BodyPart {
      position: Vector3::new(0.0, 12.0, 0.0),
      dimensions: Vector3::new(8.0, 8.0, 8.0),
      image: &image,
      layer1_location: (0, 0),
      layer2_location: (32, 0),
      rotation: Some(CenterRotation {
        quaternion: Quaternion::zero(),
        pivot_delta: Vector3::unit_y() * -4.0,
      }),
      outer_layer,
    };

    let body = BodyPart {
      position: Vector3::new(0.0, 2.0, 0.0),
      dimensions: Vector3::new(8.0, 12.0, 4.0),
      image: &image,
      layer1_location: (16, 16),
      layer2_location: (16, 32),
      rotation: None,
      outer_layer,
    };

    let arm_width = match kind {
      ModelKind::Classic => 4.0,
      ModelKind::Slim => 3.0,
    };

    let arm_dimensions = Vector3::new(arm_width, 12.0, 4.0);

    let left_arm = BodyPart {
      position: Vector3::new((-body.dimensions.x - arm_width) / 2.0, 2.0, 0.0),
      dimensions: arm_dimensions,
      image: &image,
      layer1_location: (40, 16),
      layer2_location: (40, 32),
      rotation: Some(CenterRotation {
        quaternion: Quaternion::from_angle_z(Deg(-7.0)),
        pivot_delta: Vector3::unit_y() * 4.0,
      }),
      outer_layer,
    };

    let right_arm = BodyPart {
      position: Vector3::new((body.dimensions.x + arm_width) / 2.0, 2.0, 0.0),
      dimensions: arm_dimensions,
      image: &image,
      layer1_location: (32, 48),
      layer2_location: (48, 48),
      rotation: Some(CenterRotation {
        quaternion: Quaternion::from_angle_z(Deg(7.0)),
        pivot_delta: Vector3::unit_y() * 4.0,
      }),
      outer_layer,
    };

    let leg_dimensions = Vector3::new(4.0, 12.0, 4.0);

    let left_leg = BodyPart {
      position: Vector3::new(-leg_dimensions.x / 2.0, -10.0, 0.0),
      dimensions: leg_dimensions,
      image: &image,
      layer1_location: (0, 16),
      layer2_location: (0, 32),
      rotation: Some(CenterRotation {
        quaternion: Quaternion::from_angle_z(Deg(-1.0)),
        pivot_delta: Vector3::unit_y() * 6.0,
      }),
      outer_layer,
    };

    let right_leg = BodyPart {
      position: Vector3::new(leg_dimensions.x / 2.0, -10.0, 0.0),
      dimensions: leg_dimensions,
      image: &image,
      layer1_location: (16, 48),
      layer2_location: (0, 48),
      rotation: Some(CenterRotation {
        quaternion: Quaternion::from_angle_z(Deg(1.0)),
        pivot_delta: Vector3::unit_y() * 6.0,
      }),
      outer_layer,
    };

    let texture = Texture::from_image(device, queue, &image).unwrap();
    let material = Material::new(device, texture, layout);

    // When the meshes exactly overlap a weird flickering occurs called z fighting
    // This is fixed by making some parts slightly bigger
    let z_fighting_scale = 0.002;
    let (head_inner, head_outer) = head.create(1.0 + 2.0 * z_fighting_scale, device);
    let (body_inner, body_outer) = body.create(1.0, device);
    let (left_arm_inner, left_arm_outer) = left_arm.create(1.0 + z_fighting_scale, device);
    let (right_arm_inner, right_arm_outer) = right_arm.create(1.0 + z_fighting_scale, device);
    let (left_leg_inner, left_leg_outer) = left_leg.create(1.0 + z_fighting_scale, device);
    let (right_leg_inner, right_leg_outer) = right_leg.create(1.0 + 2.0 * z_fighting_scale, device);

    let meshes = vec![
      head_inner,
      body_inner,
      left_arm_inner,
      right_arm_inner,
      left_leg_inner,
      right_leg_inner,
      head_outer,
      body_outer,
      left_arm_outer,
      right_arm_outer,
      left_leg_outer,
      right_leg_outer,
    ];

    Self { material, meshes }
  }

  pub fn to_raw() -> InstanceRaw {
    let position = Vector3::new(0.0, 0.0, 0.0);
    let rotation = Quaternion::from_axis_angle(Vector3::unit_y(), Deg(0.0));

    InstanceRaw {
      model: (Matrix4::from_translation(position) * Matrix4::from(rotation)).into(),
      normal: Matrix3::from(rotation).into(),
    }
  }
}

pub trait DrawModel<'a> {
  fn draw_model(
    &mut self,
    model: &'a Model,
    camera_bind_group: &'a wgpu::BindGroup,
    light_bind_group: &'a wgpu::BindGroup,
  );
}

impl<'a> DrawModel<'a> for wgpu::RenderPass<'a> {
  fn draw_model(
    &mut self,
    model: &'a Model,
    camera_bind_group: &'a wgpu::BindGroup,
    light_bind_group: &'a wgpu::BindGroup,
  ) {
    model.meshes.iter().for_each(|mesh| {
      self.draw_mesh(mesh, &model.material, camera_bind_group, light_bind_group);
    });
  }
}
