use cgmath::{Deg, Matrix3, Matrix4, Quaternion, Rotation3, Vector3};
use image::DynamicImage;

use crate::armor::Armor;
use crate::geometry::coordinate::Coordinate;
use crate::geometry::{BoxGeometry, Geometry, OuterLayerGeometry, Rotation, TextureRegion};
use crate::instance::InstanceRaw;
use crate::material::Material;
use crate::mesh::{DrawMesh, Mesh};
use crate::pose::Pose;
use crate::texture::Texture;

pub enum ModelKind {
  Classic,
  Slim,
}

impl ModelKind {
  fn arm_width(&self) -> f32 {
    match self {
      ModelKind::Classic => 4.0,
      ModelKind::Slim => 3.0,
    }
  }
}

#[derive(Clone, Copy)]
pub enum ModelOuterLayer {
  // Extrude outer layer (3D)
  D3,
  // Scale outer layer up (2D)
  D2,
}

const VOXEL_3D_THICKNESS: f32 = 0.75;

#[derive(Clone, Copy)]
struct CenterRotation {
  pub quaternion: Quaternion<f32>,
  pub pivot_delta: Vector3<f32>,
}

struct Placement {
  position: Vector3<f32>,
  dimensions: Vector3<f32>,
  rotation: Option<CenterRotation>,
}

impl Placement {
  fn resolve(&self) -> (Vector3<f32>, Option<Rotation>) {
    let mut position = self.position;
    position.y -= 1.0;

    let rotation = self.rotation.map(|rotation| Rotation {
      quaternion: rotation.quaternion,
      pivot: position + rotation.pivot_delta,
    });

    (position, rotation)
  }
}

// Right and left are the player's own, so the right limbs sit on the -x side
#[derive(Clone, Copy, PartialEq)]
pub enum Part {
  Head,
  Body,
  RightArm,
  LeftArm,
  RightLeg,
  LeftLeg,
}

impl Part {
  const ALL: [Part; 6] = [
    Part::Head,
    Part::Body,
    Part::RightArm,
    Part::LeftArm,
    Part::RightLeg,
    Part::LeftLeg,
  ];

  fn placement(self, arm_width: f32, pose: Pose) -> Placement {
    let side = match self {
      Part::RightArm | Part::RightLeg => -1.0,
      _ => 1.0,
    };

    let (mut position, dimensions, rest_angle, pivot_height) = match self {
      Part::Head => (
        Vector3::new(0.0, 12.0, 0.0),
        Vector3::new(8.0, 8.0, 8.0),
        0.0,
        -4.0,
      ),
      Part::Body => (
        Vector3::new(0.0, 2.0, 0.0),
        Vector3::new(8.0, 12.0, 4.0),
        0.0,
        6.0,
      ),
      Part::RightArm | Part::LeftArm => (
        Vector3::new(side * (8.0 + arm_width) / 2.0, 2.0, 0.0),
        Vector3::new(arm_width, 12.0, 4.0),
        side * 7.0,
        4.0,
      ),
      Part::RightLeg | Part::LeftLeg => (
        Vector3::new(side * 2.0, -10.0, 0.0),
        Vector3::new(4.0, 12.0, 4.0),
        side,
        6.0,
      ),
    };

    let quaternion = match pose.part(self) {
      // Even a turn by nothing would round the body's vertices and shift every render
      None if self == Part::Body => None,
      None => Some(Quaternion::from_angle_z(Deg(rest_angle))),
      Some(part_pose) => {
        position += part_pose.offset;

        let turn = part_pose.rotation;

        Some(
          Quaternion::from_angle_z(Deg(rest_angle + turn.z))
            * Quaternion::from_angle_y(Deg(turn.y))
            * Quaternion::from_angle_x(Deg(turn.x)),
        )
      }
    };

    Placement {
      position,
      dimensions,
      rotation: quaternion.map(|quaternion| CenterRotation {
        quaternion,
        pivot_delta: Vector3::unit_y() * pivot_height,
      }),
    }
  }

  fn skin_layer_locations(self) -> (Coordinate<u32>, Coordinate<u32>) {
    match self {
      Part::Head => ((0, 0), (32, 0)),
      Part::Body => ((16, 16), (16, 32)),
      Part::RightArm => ((40, 16), (40, 32)),
      Part::LeftArm => ((32, 48), (48, 48)),
      Part::RightLeg => ((0, 16), (0, 32)),
      Part::LeftLeg => ((16, 48), (0, 48)),
    }
  }

  // Armour textures only have the right limbs, which the left limbs mirror
  fn armor_region(self) -> TextureRegion {
    let location = match self {
      Part::Head => (0, 0),
      Part::Body => (16, 16),
      Part::RightArm | Part::LeftArm => (40, 16),
      Part::RightLeg | Part::LeftLeg => (0, 16),
    };

    TextureRegion {
      location,
      texture_size: (64, 32),
      mirror: matches!(self, Part::LeftArm | Part::LeftLeg),
    }
  }

  // When the meshes exactly overlap a weird flickering occurs called z fighting
  // This is fixed by making some parts slightly bigger
  fn z_fighting_scale(self) -> f32 {
    let z_fighting_scale = 0.002;

    match self {
      Part::Head | Part::LeftLeg => 1.0 + 2.0 * z_fighting_scale,
      Part::Body => 1.0,
      Part::RightArm | Part::LeftArm | Part::RightLeg => 1.0 + z_fighting_scale,
    }
  }
}

struct BodyPart<'a> {
  pub placement: Placement,

  pub image: &'a DynamicImage,

  pub layer1_location: Coordinate<u32>,
  pub layer2_location: Coordinate<u32>,

  pub outer_layer: ModelOuterLayer,
  pub pose: Pose,
}

impl<'a> BodyPart<'a> {
  fn create(self, scale: f32, device: &wgpu::Device) -> (Mesh, Mesh) {
    let texture_size = (64, 64);

    let (position, rotation) = self.placement.resolve();
    let dimensions = self.placement.dimensions;

    let mut inner_geometry = BoxGeometry {
      position,
      dimensions,
      texture_region: TextureRegion {
        location: self.layer1_location,
        texture_size,
        mirror: false,
      },
      rotation,
      inflation: 0.0,
    }
    .create();

    let texture_region = TextureRegion {
      location: self.layer2_location,
      texture_size,
      mirror: false,
    };

    let mut outer_geometry = match self.outer_layer {
      ModelOuterLayer::D3 => OuterLayerGeometry {
        position,
        dimensions,
        image: self.image,
        thickness: VOXEL_3D_THICKNESS,
        texture_region,
        rotation,
        extrude: true,
      }
      .create(),
      ModelOuterLayer::D2 => {
        let mut layer = OuterLayerGeometry {
          position,
          dimensions,
          image: self.image,
          thickness: 0.001,
          texture_region,
          rotation,
          extrude: false,
        }
        .create();
        // In Minecraft the outer layer is scaled up 12.5%
        layer.scale_around(1.125, position);
        layer
      }
    };

    inner_geometry.scale_around(scale, position);
    outer_geometry.scale_around(scale, position);

    self.pose.place(&mut inner_geometry);
    self.pose.place(&mut outer_geometry);

    (
      Mesh::from_geometry(device, inner_geometry),
      Mesh::from_geometry(device, outer_geometry),
    )
  }
}

struct Attachment {
  material: Material,
  mesh: Mesh,
  enchanted: bool,
}

pub struct Model {
  material: Material,
  meshes: Vec<Mesh>,
  attachments: Vec<Attachment>,
  pose: Pose,
  wears_armor: bool,
}

impl Model {
  // The armour decides which parts keep an extruded outer layer, so it can't be attached later
  // Three of the arguments are the wgpu handles every attachment is built with
  #[allow(clippy::too_many_arguments)]
  pub fn new(
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    layout: &wgpu::BindGroupLayout,
    image: DynamicImage,
    kind: ModelKind,
    outer_layer: ModelOuterLayer,
    pose: Pose,
    armor: &Armor,
  ) -> Self {
    let arm_width = kind.arm_width();

    let (inner_meshes, outer_meshes): (Vec<Mesh>, Vec<Mesh>) = Part::ALL
      .iter()
      .map(|&part| {
        let (layer1_location, layer2_location) = part.skin_layer_locations();

        BodyPart {
          placement: part.placement(arm_width, pose),
          image: &image,
          layer1_location,
          layer2_location,
          outer_layer: if armor.flattens(part) {
            ModelOuterLayer::D2
          } else {
            outer_layer
          },
          pose,
        }
        .create(part.z_fighting_scale(), device)
      })
      .unzip();

    let texture = Texture::from_image(device, queue, &image).unwrap();
    let material = Material::new(device, texture, layout);

    let mut model = Self {
      material,
      meshes: inner_meshes.into_iter().chain(outer_meshes).collect(),
      attachments: vec![],
      pose,
      wears_armor: armor.helmet.is_some() || armor.pieces().next().is_some(),
    };

    model.attach_armor(device, queue, layout, armor);
    model
  }

  pub fn pose(&self) -> Pose {
    self.pose
  }

  pub fn wears_armor(&self) -> bool {
    self.wears_armor
  }

  fn attach_armor(
    &mut self,
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    layout: &wgpu::BindGroupLayout,
    armor: &Armor,
  ) {
    for (piece, layer, parts) in armor.pieces() {
      let mut geometry = Geometry::new(vec![], vec![]);

      for part in parts {
        // Armour is shaped for classic arms on every skin
        let placement = part.placement(ModelKind::Classic.arm_width(), self.pose);
        let (position, rotation) = placement.resolve();

        let mut box_geometry = BoxGeometry {
          position,
          dimensions: placement.dimensions,
          texture_region: part.armor_region(),
          rotation,
          inflation: layer.inflation(),
        }
        .create();

        box_geometry.scale_around(part.z_fighting_scale(), position);
        geometry.combine(box_geometry);
      }

      self.attach(
        device,
        queue,
        layout,
        &piece.texture(layer),
        geometry,
        piece.enchanted.unwrap_or(false),
      );
    }
  }

  // Sized as the game draws a worn player head
  pub fn attach_head(
    &mut self,
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    layout: &wgpu::BindGroupLayout,
    head: &DynamicImage,
  ) {
    let placement = Part::Head.placement(ModelKind::Classic.arm_width(), self.pose);
    let (position, rotation) = placement.resolve();
    let (head_location, hat_location) = Part::Head.skin_layer_locations();
    let mut geometry = Geometry::new(vec![], vec![]);

    for (location, inflation) in [(head_location, 0.0), (hat_location, 0.25)] {
      geometry.combine(
        BoxGeometry {
          position,
          dimensions: placement.dimensions,
          texture_region: TextureRegion {
            location,
            texture_size: (64, 64),
            mirror: false,
          },
          rotation,
          inflation,
        }
        .create(),
      );
    }

    let neck = position - Vector3::unit_y() * placement.dimensions.y / 2.0;
    geometry.scale_around(1.1875, neck);

    self.attach(device, queue, layout, head, geometry, false);
  }

  pub fn attach_cape(
    &mut self,
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    layout: &wgpu::BindGroupLayout,
    cape: &DynamicImage,
    chestplate: bool,
  ) {
    let body = Part::Body.placement(ModelKind::Classic.arm_width(), Pose::Standing);
    let (body_position, _) = body.resolve();

    // Over a chestplate the cape moves out and up so it doesn't cut through it, as
    // newer versions of the game do
    let (lift, gap) = if chestplate { (0.85, 1.1) } else { (0.0, 0.0) };
    let top = body_position.y + body.dimensions.y / 2.0 + lift;
    let back = body_position.z - body.dimensions.z / 2.0 - gap;

    let dimensions = Vector3::new(10.0, 16.0, 1.0);
    let position = Vector3::new(0.0, top - dimensions.y / 2.0, back - dimensions.z / 2.0);

    // Turned around so the outside of the cape shows its front texture
    let mut geometry = BoxGeometry {
      position,
      dimensions,
      texture_region: TextureRegion {
        location: (0, 0),
        texture_size: (64, 32),
        mirror: false,
      },
      rotation: Some(Rotation {
        quaternion: Quaternion::from_angle_y(Deg(180.0)),
        pivot: position,
      }),
      inflation: 0.0,
    }
    .create();

    let (swing, offset) = self.pose.cape();

    geometry.rotate_around(Rotation {
      // A standing player's cape swings 6 degrees out from the back
      quaternion: Quaternion::from_angle_x(Deg(6.0 + swing)),
      pivot: Vector3::new(0.0, top, back),
    });
    geometry.translate(offset);

    self.attach(device, queue, layout, cape, geometry, false);
  }

  fn attach(
    &mut self,
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    layout: &wgpu::BindGroupLayout,
    texture: &DynamicImage,
    mut geometry: Geometry,
    enchanted: bool,
  ) {
    self.pose.place(&mut geometry);

    let texture = Texture::from_image(device, queue, texture).unwrap();

    self.attachments.push(Attachment {
      material: Material::new(device, texture, layout),
      mesh: Mesh::from_geometry(device, geometry),
      enchanted,
    });
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

  fn draw_attachments(
    &mut self,
    model: &'a Model,
    enchanted: bool,
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

  fn draw_attachments(
    &mut self,
    model: &'a Model,
    enchanted: bool,
    camera_bind_group: &'a wgpu::BindGroup,
    light_bind_group: &'a wgpu::BindGroup,
  ) {
    model
      .attachments
      .iter()
      .filter(|attachment| attachment.enchanted == enchanted)
      .for_each(|attachment| {
        self.draw_mesh(
          &attachment.mesh,
          &attachment.material,
          camera_bind_group,
          light_bind_group,
        );
      });
  }
}
