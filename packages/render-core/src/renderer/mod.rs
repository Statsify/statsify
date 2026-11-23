mod backend;
#[cfg(not(target_arch = "wasm32"))]
pub mod native;
#[cfg(target_arch = "wasm32")]
pub mod wasm;

use std::mem::size_of;

use bytemuck::cast_slice;
use cgmath::{Matrix4, Point3, Transform};
use wgpu::util::DeviceExt;
#[cfg(target_arch = "wasm32")]
use winit::dpi::PhysicalSize;
#[cfg(target_arch = "wasm32")]
use winit::event::{ElementState, MouseScrollDelta};

pub use self::backend::Backend;
use crate::camera::{Camera, CameraUniform, OrbitalCamera};
#[cfg(not(target_arch = "wasm32"))]
use crate::error::Error;
use crate::error::Result;
use crate::geometry::vertex::{Vertex, VertexDescriptor};
use crate::instance::InstanceRaw;
use crate::light::LightUniform;
use crate::material::Material;
use crate::mesh::{DrawMesh, Mesh};
use crate::texture::Texture;

pub enum Pipeline<'a> {
  // Only fully opaque texels
  Cutout,
  // Cutout's texels, then the partly transparent ones over everything else
  Translucent,
  // Translucent for a player's skin and what they wear, with an enchanted piece's glint. It blends
  // before Translucent, since the body lies behind it.
  Worn(Option<&'a Material>),
}

pub struct DrawItem<'a> {
  pub mesh: &'a Mesh,
  pub material: &'a Material,
  pub pipeline: Pipeline<'a>,
  pub transform: Matrix4<f32>,
}

struct Pipelines {
  cutout: wgpu::RenderPipeline,
  blended: wgpu::RenderPipeline,
  enchanted_cutout: wgpu::RenderPipeline,
  enchanted_blended: wgpu::RenderPipeline,
}

pub struct Renderer<T: Backend> {
  backend: T,
  config: wgpu::SurfaceConfiguration,

  texture_bind_group_layout: wgpu::BindGroupLayout,
  sampler: wgpu::Sampler,
  glint_sampler: wgpu::Sampler,

  #[cfg(target_arch = "wasm32")]
  viewer: Viewer,

  #[cfg(not(target_arch = "wasm32"))]
  camera_bind_group_layout: wgpu::BindGroupLayout,
  #[cfg(not(target_arch = "wasm32"))]
  light_bind_group_layout: wgpu::BindGroupLayout,
  pipelines: Pipelines,

  depth_texture: Texture,
}

impl<T: Backend> Renderer<T> {
  async fn create(backend: T) -> Result<Self> {
    let device = backend.device();
    let config = backend.create_config();

    let texture_bind_group_layout =
      device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
        entries: &[
          wgpu::BindGroupLayoutEntry {
            binding: 0,
            visibility: wgpu::ShaderStages::FRAGMENT,
            ty: wgpu::BindingType::Texture {
              multisampled: false,
              view_dimension: wgpu::TextureViewDimension::D2,
              sample_type: wgpu::TextureSampleType::Float { filterable: true },
            },
            count: None,
          },
          wgpu::BindGroupLayoutEntry {
            binding: 1,
            visibility: wgpu::ShaderStages::FRAGMENT,
            ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering),
            count: None,
          },
        ],
        label: Some("texture_bind_group_layout"),
      });

    let sampler = device.create_sampler(&wgpu::SamplerDescriptor {
      address_mode_u: wgpu::AddressMode::ClampToEdge,
      address_mode_v: wgpu::AddressMode::ClampToEdge,
      address_mode_w: wgpu::AddressMode::ClampToEdge,
      mag_filter: wgpu::FilterMode::Nearest,
      min_filter: wgpu::FilterMode::Nearest,
      mipmap_filter: wgpu::FilterMode::Nearest,
      ..Default::default()
    });

    let glint_sampler = device.create_sampler(&wgpu::SamplerDescriptor {
      address_mode_u: wgpu::AddressMode::Repeat,
      address_mode_v: wgpu::AddressMode::Repeat,
      mag_filter: wgpu::FilterMode::Linear,
      min_filter: wgpu::FilterMode::Linear,
      ..Default::default()
    });

    let camera_bind_group_layout = uniform_layout(device, Some("camera_bind_group_layout"));
    let light_bind_group_layout = uniform_layout(device, None);

    #[cfg(target_arch = "wasm32")]
    let viewer = Viewer::new(
      device,
      &config,
      &camera_bind_group_layout,
      &light_bind_group_layout,
    );

    let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
      label: Some("shader.wgsl"),
      source: wgpu::ShaderSource::Wgsl(include_str!("shader.wgsl").into()),
    });

    let bind_group_layouts = [
      &texture_bind_group_layout,
      &camera_bind_group_layout,
      &light_bind_group_layout,
    ];

    let enchanted_bind_group_layouts = [
      &texture_bind_group_layout,
      &camera_bind_group_layout,
      &light_bind_group_layout,
      &texture_bind_group_layout,
    ];

    let create = |layouts: &[&wgpu::BindGroupLayout], fragment_entry_point, depth_write| {
      Self::create_render_pipeline(
        device,
        &shader,
        layouts,
        &config,
        fragment_entry_point,
        depth_write,
      )
    };

    let pipelines = Pipelines {
      cutout: create(&bind_group_layouts, "fs_cutout", true),
      // Blended texels leave the depth alone, so nothing drawn behind them later is hidden
      blended: create(&bind_group_layouts, "fs_blended", false),
      enchanted_cutout: create(&enchanted_bind_group_layouts, "fs_enchanted_cutout", true),
      enchanted_blended: create(&enchanted_bind_group_layouts, "fs_enchanted_blended", false),
    };

    let depth_texture = Texture::create_depth_texture(device, &config, "depth_texture");

    Ok(Self {
      backend,
      config,

      texture_bind_group_layout,
      sampler,
      glint_sampler,

      #[cfg(target_arch = "wasm32")]
      viewer,

      #[cfg(not(target_arch = "wasm32"))]
      camera_bind_group_layout,
      #[cfg(not(target_arch = "wasm32"))]
      light_bind_group_layout,
      pipelines,

      depth_texture,
    })
  }

  fn create_render_pipeline(
    device: &wgpu::Device,
    shader: &wgpu::ShaderModule,
    bind_group_layouts: &[&wgpu::BindGroupLayout],
    config: &wgpu::SurfaceConfiguration,
    fragment_entry_point: &str,
    depth_write_enabled: bool,
  ) -> wgpu::RenderPipeline {
    let layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
      label: Some("Render Pipeline Layout"),
      bind_group_layouts,
      push_constant_ranges: &[],
    });

    device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
      label: Some("Render Pipeline"),
      layout: Some(&layout),
      vertex: wgpu::VertexState {
        module: shader,
        entry_point: Some("vs_main"),
        buffers: &[Vertex::descriptor(), InstanceRaw::descriptor()],
        compilation_options: wgpu::PipelineCompilationOptions::default(),
      },
      fragment: Some(wgpu::FragmentState {
        module: shader,
        entry_point: Some(fragment_entry_point),
        targets: &[Some(wgpu::ColorTargetState {
          format: config.format,
          blend: Some(wgpu::BlendState::ALPHA_BLENDING),
          write_mask: wgpu::ColorWrites::ALL,
        })],
        compilation_options: wgpu::PipelineCompilationOptions::default(),
      }),
      primitive: wgpu::PrimitiveState {
        topology: wgpu::PrimitiveTopology::TriangleList,
        strip_index_format: None,
        front_face: wgpu::FrontFace::Ccw,
        cull_mode: Some(wgpu::Face::Back),
        polygon_mode: wgpu::PolygonMode::Fill,
        unclipped_depth: false,
        conservative: false,
      },
      depth_stencil: Some(wgpu::DepthStencilState {
        format: Texture::DEPTH_FORMAT,
        depth_write_enabled,
        depth_compare: wgpu::CompareFunction::LessEqual,
        stencil: wgpu::StencilState::default(),
        bias: wgpu::DepthBiasState::default(),
      }),
      multisample: wgpu::MultisampleState {
        count: 1,
        mask: !0,
        alpha_to_coverage_enabled: false,
      },
      multiview: None,
      cache: None,
    })
  }

  fn render_sync(
    &self,
    items: &[DrawItem<'_>],
    camera: &Camera,
    camera_bind_group: &wgpu::BindGroup,
    light_bind_group: &wgpu::BindGroup,
    view: &wgpu::TextureView,
    depth_view: &wgpu::TextureView,
  ) -> wgpu::CommandEncoder {
    let device = self.backend.device();

    let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
      label: Some("Render Encoder"),
    });

    let instances: Vec<InstanceRaw> = items
      .iter()
      .map(|item| InstanceRaw::new(item.transform))
      .collect();

    let instance_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Instance Buffer"),
      contents: cast_slice(&instances),
      usage: wgpu::BufferUsages::VERTEX,
    });

    let instance_size = size_of::<InstanceRaw>() as wgpu::BufferAddress;

    let translucent: Vec<usize> = (0..items.len())
      .filter(|&index| {
        matches!(items[index].pipeline, Pipeline::Translucent) && items[index].material.blends
      })
      .collect();

    let centers: Vec<Point3<f32>> = translucent
      .iter()
      .map(|&index| {
        items[index]
          .transform
          .transform_point(items[index].mesh.center)
      })
      .collect();

    let worn = (0..items.len()).filter(|&index| {
      matches!(items[index].pipeline, Pipeline::Worn(_)) && items[index].material.blends
    });

    let pipelines = &self.pipelines;

    let blended = |index: usize| match items[index].pipeline {
      Pipeline::Worn(Some(glint)) => (index, &pipelines.enchanted_blended, Some(glint)),
      _ => (index, &pipelines.blended, None),
    };

    // Every item in order, then the partly transparent texels: worn ones, then the rest farthest
    // first, so each blends over whatever lies behind it
    let draws = items
      .iter()
      .enumerate()
      .map(|(index, item)| match item.pipeline {
        Pipeline::Cutout | Pipeline::Translucent | Pipeline::Worn(None) => {
          (index, &pipelines.cutout, None)
        }
        Pipeline::Worn(Some(glint)) => (index, &pipelines.enchanted_cutout, Some(glint)),
      })
      .chain(worn.map(&blended))
      .chain(
        back_to_front(camera.view_projection_matrix(), &centers)
          .into_iter()
          .map(|order| blended(translucent[order])),
      );

    {
      let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
        label: Some("Render Pass"),
        color_attachments: &[Some(wgpu::RenderPassColorAttachment {
          view,
          resolve_target: None,
          depth_slice: None,
          ops: wgpu::Operations {
            load: wgpu::LoadOp::Clear(wgpu::Color::TRANSPARENT),
            store: wgpu::StoreOp::Store,
          },
        })],
        depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
          view: depth_view,
          depth_ops: Some(wgpu::Operations {
            load: wgpu::LoadOp::Clear(1.0),
            store: wgpu::StoreOp::Store,
          }),
          stencil_ops: None,
        }),
        occlusion_query_set: None,
        timestamp_writes: None,
      });

      for (index, pipeline, glint) in draws {
        let item = &items[index];
        render_pass.set_pipeline(pipeline);

        if let Some(glint) = glint {
          render_pass.set_bind_group(3, &glint.bind_group, &[]);
        }

        let offset = index as wgpu::BufferAddress * instance_size;
        render_pass.set_vertex_buffer(1, instance_buffer.slice(offset..offset + instance_size));

        render_pass.draw_mesh(
          item.mesh,
          item.material,
          camera_bind_group,
          light_bind_group,
        );
      }
    };

    encoder
  }

  pub fn device(&self) -> &wgpu::Device {
    self.backend.device()
  }

  pub fn queue(&self) -> &wgpu::Queue {
    self.backend.queue()
  }

  pub fn texture_bind_group_layout(&self) -> &wgpu::BindGroupLayout {
    &self.texture_bind_group_layout
  }

  pub fn sampler(&self) -> &wgpu::Sampler {
    &self.sampler
  }

  pub fn glint_sampler(&self) -> &wgpu::Sampler {
    &self.glint_sampler
  }
}

fn uniform_layout(device: &wgpu::Device, label: Option<&str>) -> wgpu::BindGroupLayout {
  device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
    entries: &[wgpu::BindGroupLayoutEntry {
      binding: 0,
      visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
      ty: wgpu::BindingType::Buffer {
        ty: wgpu::BufferBindingType::Uniform,
        has_dynamic_offset: false,
        min_binding_size: None,
      },
      count: None,
    }],
    label,
  })
}

#[cfg(target_arch = "wasm32")]
use winit::window::Window;

use crate::camera::CameraBehavior;

#[cfg(target_arch = "wasm32")]
struct Viewer {
  camera: Camera,
  camera_uniform: CameraUniform,
  camera_buffer: wgpu::Buffer,
  camera_bind_group: wgpu::BindGroup,

  light_uniform: LightUniform,
  light_buffer: wgpu::Buffer,
  light_bind_group: wgpu::BindGroup,
}

#[cfg(target_arch = "wasm32")]
impl Viewer {
  fn new(
    device: &wgpu::Device,
    config: &wgpu::SurfaceConfiguration,
    camera_layout: &wgpu::BindGroupLayout,
    light_layout: &wgpu::BindGroupLayout,
  ) -> Self {
    let camera = Camera::Orbital(OrbitalCamera::new(
      (0.0, 0.0, 0.0).into(),
      config.width as f32,
      config.height as f32,
    ));

    let camera_uniform = CameraUniform::new(&camera);

    let camera_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Camera Buffer"),
      contents: cast_slice(&[camera_uniform]),
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    });

    let camera_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      layout: camera_layout,
      entries: &[wgpu::BindGroupEntry {
        binding: 0,
        resource: camera_buffer.as_entire_binding(),
      }],
      label: Some("camera_bind_group"),
    });

    let light_uniform = LightUniform::from(&camera);

    let light_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Light VB"),
      contents: cast_slice(&[light_uniform]),
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    });

    let light_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      layout: light_layout,
      entries: &[wgpu::BindGroupEntry {
        binding: 0,
        resource: light_buffer.as_entire_binding(),
      }],
      label: None,
    });

    Self {
      camera,
      camera_uniform,
      camera_buffer,
      camera_bind_group,

      light_uniform,
      light_buffer,
      light_bind_group,
    }
  }
}

#[cfg(target_arch = "wasm32")]
impl Renderer<wasm::WasmBackend> {
  pub async fn new(window: Window) -> Result<Self> {
    let backend = wasm::WasmBackend::new(window).await?;
    Self::create(backend).await
  }

  pub fn render(&self, items: &[DrawItem<'_>]) {
    let output_texture = self.backend.get_output_texture();

    let encoder = self.render_sync(
      items,
      &self.viewer.camera,
      &self.viewer.camera_bind_group,
      &self.viewer.light_bind_group,
      &wasm::WasmBackend::create_view(&output_texture),
      &self.depth_texture.view,
    );

    self
      .backend
      .handle_encoder_after_render(encoder, output_texture)
  }

  pub fn window(&self) -> &Window {
    self.backend.window()
  }

  pub fn update(&mut self) {
    let queue = self.backend.queue();
    let viewer = &mut self.viewer;

    viewer.camera_uniform.update_view_projection(&viewer.camera);
    queue.write_buffer(
      &viewer.camera_buffer,
      0,
      cast_slice(&[viewer.camera_uniform]),
    );

    viewer
      .light_uniform
      .update_position(viewer.camera.eye().into());
    queue.write_buffer(&viewer.light_buffer, 0, cast_slice(&[viewer.light_uniform]));
  }

  pub fn process_mouse_input(&mut self, state: &ElementState) {
    self.backend.mouse_pressed = state == &ElementState::Pressed;
  }

  pub fn process_mouse_movement(&mut self, delta: (f64, f64)) {
    if !self.backend.mouse_pressed {
      return;
    }

    self.viewer.camera.process_mouse_movement(delta);
  }

  pub fn process_mouse_scroll(&mut self, delta: &MouseScrollDelta) {
    if !self.backend.mouse_pressed {
      return;
    }

    match delta {
      MouseScrollDelta::LineDelta(_, y) => self.viewer.camera.process_mouse_scroll(*y),
      MouseScrollDelta::PixelDelta(delta) => {
        self.viewer.camera.process_mouse_scroll(delta.y as f32)
      }
    }
  }

  pub fn resize(&mut self, new_size: PhysicalSize<u32>) {
    if new_size.width > 0 && new_size.height > 0 {
      self.backend.size = new_size;
      self.config.width = new_size.width;
      self.config.height = new_size.height;

      let device = self.backend.device();
      let surface = &self.backend.surface;

      surface.configure(device, &self.config);
      self.depth_texture = Texture::create_depth_texture(device, &self.config, "depth_texture");
    }
  }
}

#[cfg(not(target_arch = "wasm32"))]
impl Renderer<native::NativeBackend> {
  pub async fn new(width: u32, height: u32) -> Result<Self> {
    let backend = native::NativeBackend::new(width, height).await?;
    Self::create(backend).await
  }

  pub fn camera(&self) -> OrbitalCamera {
    OrbitalCamera::new(
      (0.0, 0.0, 0.0).into(),
      self.config.width as f32,
      self.config.height as f32,
    )
  }

  // This and render_sized wait on the GPU, so async callers run them on a blocking thread
  pub fn render(&self, items: &[DrawItem<'_>], camera: &Camera) -> Result<Vec<u8>> {
    self.render_into(
      items,
      camera,
      self.backend.get_output_texture(),
      &self.depth_texture,
    )
  }

  // Renders into textures of its own, at any size the device allows
  pub fn render_sized(
    &self,
    items: &[DrawItem<'_>],
    camera: &Camera,
    width: u32,
    height: u32,
  ) -> Result<Vec<u8>> {
    let device = self.backend.device();
    let limit = device.limits().max_texture_dimension_2d;

    if !(1..=limit).contains(&width) || !(1..=limit).contains(&height) {
      return Err(Error::OutputSize(limit));
    }

    let output_texture = native::NativeBackend::create_texture(device, width, height);

    let config = wgpu::SurfaceConfiguration {
      width,
      height,
      ..self.config.clone()
    };

    let depth_texture = Texture::create_depth_texture(device, &config, "depth_texture");

    self.render_into(items, camera, &output_texture, &depth_texture)
  }

  // Renders run on several threads at once, so each gets its own camera and light
  // instead of rewriting the shared ones
  fn render_into(
    &self,
    items: &[DrawItem<'_>],
    camera: &Camera,
    output_texture: &wgpu::Texture,
    depth_texture: &Texture,
  ) -> Result<Vec<u8>> {
    let camera_bind_group = self.uniform_bind_group(
      &self.camera_bind_group_layout,
      cast_slice(&[CameraUniform::new(camera)]),
    );
    let light_bind_group = self.uniform_bind_group(
      &self.light_bind_group_layout,
      cast_slice(&[LightUniform::from(camera)]),
    );

    let encoder = self.render_sync(
      items,
      camera,
      &camera_bind_group,
      &light_bind_group,
      &native::NativeBackend::create_view(&output_texture),
      &depth_texture.view,
    );

    self
      .backend
      .handle_encoder_after_render(encoder, output_texture)
  }

  fn uniform_bind_group(&self, layout: &wgpu::BindGroupLayout, contents: &[u8]) -> wgpu::BindGroup {
    let device = self.backend.device();

    let buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: None,
      contents,
      usage: wgpu::BufferUsages::UNIFORM,
    });

    device.create_bind_group(&wgpu::BindGroupDescriptor {
      layout,
      entries: &[wgpu::BindGroupEntry {
        binding: 0,
        resource: buffer.as_entire_binding(),
      }],
      label: None,
    })
  }
}

// Indices of the points from farthest to nearest along the view, which a perspective
// projection carries as w
fn back_to_front(view_projection: Matrix4<f32>, points: &[Point3<f32>]) -> Vec<usize> {
  let depth = |index: usize| (view_projection * points[index].to_homogeneous()).w;
  let mut order: Vec<usize> = (0..points.len()).collect();
  order.sort_by(|&a, &b| depth(b).total_cmp(&depth(a)));
  order
}

#[cfg(test)]
mod tests {
  use cgmath::{perspective, Deg, Vector3};

  use super::*;

  #[test]
  #[allow(
    clippy::disallowed_methods,
    reason = "the expected order doesn't hang on rounding"
  )]
  fn orders_points_farthest_first() {
    let view = Matrix4::look_at_rh(
      Point3::new(10.0, 4.0, -2.0),
      Point3::new(10.0, 4.0, -12.0),
      Vector3::unit_y(),
    );
    let view_projection = perspective(Deg(40.0), 1.5, 0.1, 100.0) * view;

    // The first is farther from the eye than the second but nearer along the view
    let points = [
      Point3::new(19.0, 4.0, -11.0),
      Point3::new(10.0, 4.0, -12.0),
      Point3::new(10.0, 7.0, -4.0),
      Point3::new(9.0, 4.0, -11.5),
    ];

    assert_eq!(back_to_front(view_projection, &points), [1, 3, 0, 2]);
    assert_eq!(back_to_front(view_projection, &[]), Vec::<usize>::new());
  }
}
