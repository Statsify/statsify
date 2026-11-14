mod backend;
#[cfg(not(target_arch = "wasm32"))]
pub mod native;
#[cfg(target_arch = "wasm32")]
pub mod wasm;

use std::mem::size_of;

use bytemuck::cast_slice;
use cgmath::{Matrix4, MetricSpace, Point3, SquareMatrix, Transform};
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

// Draws with fs_main, fs_attachment, or fs_enchanted and its glint texture
pub enum Pipeline<'a> {
  Main,
  Attachment,
  Enchanted(&'a Material),
  // Only fully opaque texels
  Cutout,
  // Cutout's texels, then the partly transparent ones over everything else
  Translucent,
}

pub struct DrawItem<'a> {
  pub mesh: &'a Mesh,
  pub material: &'a Material,
  pub pipeline: Pipeline<'a>,
  pub transform: Matrix4<f32>,
}

struct Pipelines {
  main: wgpu::RenderPipeline,
  attachment: wgpu::RenderPipeline,
  enchanted: wgpu::RenderPipeline,
  cutout: wgpu::RenderPipeline,
  blended: wgpu::RenderPipeline,
}

pub struct Renderer<T: Backend> {
  backend: T,
  config: wgpu::SurfaceConfiguration,

  texture_bind_group_layout: wgpu::BindGroupLayout,

  camera: Camera,
  camera_uniform: CameraUniform,
  camera_buffer: wgpu::Buffer,

  light_uniform: LightUniform,
  light_buffer: wgpu::Buffer,

  camera_bind_group_layout: wgpu::BindGroupLayout,
  light_bind_group_layout: wgpu::BindGroupLayout,
  camera_bind_group: wgpu::BindGroup,
  light_bind_group: wgpu::BindGroup,
  pipelines: Pipelines,
  // A transform that mirrors a mesh turns its triangles around, so these cull the other side
  mirrored_pipelines: Pipelines,

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

    let (camera, camera_uniform, camera_buffer, camera_bind_group_layout, camera_bind_group) =
      Self::create_camera(device, &config);

    let (light_uniform, light_buffer, light_bind_group_layout, light_bind_group) =
      Self::create_light(device, &camera);

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

    let create_pipelines = |cull_mode| {
      let create = |layouts: &[&wgpu::BindGroupLayout], fragment_entry_point, depth_write| {
        Self::create_render_pipeline(
          device,
          &shader,
          layouts,
          &config,
          fragment_entry_point,
          cull_mode,
          depth_write,
        )
      };

      Pipelines {
        main: create(&bind_group_layouts, "fs_main", true),
        attachment: create(&bind_group_layouts, "fs_attachment", true),
        enchanted: create(&enchanted_bind_group_layouts, "fs_enchanted", true),
        cutout: create(&bind_group_layouts, "fs_cutout", true),
        // Blended texels leave the depth alone, so nothing drawn behind them later is hidden
        blended: create(&bind_group_layouts, "fs_blended", false),
      }
    };

    let pipelines = create_pipelines(wgpu::Face::Back);
    let mirrored_pipelines = create_pipelines(wgpu::Face::Front);

    let depth_texture = Texture::create_depth_texture(device, &config, "depth_texture");

    Ok(Self {
      backend,
      config,

      texture_bind_group_layout,

      camera,
      camera_uniform,
      camera_buffer,

      light_uniform,
      light_buffer,

      camera_bind_group_layout,
      light_bind_group_layout,
      camera_bind_group,
      light_bind_group,
      pipelines,
      mirrored_pipelines,

      depth_texture,
    })
  }

  fn create_camera(
    device: &wgpu::Device,
    config: &wgpu::SurfaceConfiguration,
  ) -> (
    Camera,
    CameraUniform,
    wgpu::Buffer,
    wgpu::BindGroupLayout,
    wgpu::BindGroup,
  ) {
    let camera = Camera::Orbital(OrbitalCamera::new(
      (0.0, 0.0, 0.0).into(),
      config.width as f32,
      config.height as f32,
    ));

    let camera_uniform = CameraUniform::new(&camera);

    let buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Camera Buffer"),
      contents: cast_slice(&[camera_uniform]),
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    });

    let layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
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
      label: Some("camera_bind_group_layout"),
    });

    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      layout: &layout,
      entries: &[wgpu::BindGroupEntry {
        binding: 0,
        resource: buffer.as_entire_binding(),
      }],
      label: Some("camera_bind_group"),
    });

    (camera, camera_uniform, buffer, layout, bind_group)
  }

  fn create_light(
    device: &wgpu::Device,
    camera: &Camera,
  ) -> (
    LightUniform,
    wgpu::Buffer,
    wgpu::BindGroupLayout,
    wgpu::BindGroup,
  ) {
    let light_uniform = LightUniform::from(camera);

    let buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Light VB"),
      contents: bytemuck::cast_slice(&[light_uniform]),
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    });

    let layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
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
      label: None,
    });

    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      layout: &layout,
      entries: &[wgpu::BindGroupEntry {
        binding: 0,
        resource: buffer.as_entire_binding(),
      }],
      label: None,
    });

    (light_uniform, buffer, layout, bind_group)
  }

  fn create_render_pipeline(
    device: &wgpu::Device,
    shader: &wgpu::ShaderModule,
    bind_group_layouts: &[&wgpu::BindGroupLayout],
    config: &wgpu::SurfaceConfiguration,
    fragment_entry_point: &str,
    cull_mode: wgpu::Face,
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
        cull_mode: Some(cull_mode),
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
    eye: Point3<f32>,
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
      .filter(|&index| matches!(items[index].pipeline, Pipeline::Translucent))
      .collect();

    let centers: Vec<Point3<f32>> = translucent
      .iter()
      .map(|&index| {
        items[index]
          .transform
          .transform_point(items[index].mesh.center)
      })
      .collect();

    // Every item in order, then the partly transparent texels farthest first, so each blends over
    // whatever lies behind it
    let draws = items
      .iter()
      .enumerate()
      .map(|(index, item)| {
        let pipelines = self.pipelines_for(item);

        match item.pipeline {
          Pipeline::Main => (index, &pipelines.main, None),
          Pipeline::Attachment => (index, &pipelines.attachment, None),
          Pipeline::Enchanted(glint) => (index, &pipelines.enchanted, Some(glint)),
          Pipeline::Cutout | Pipeline::Translucent => (index, &pipelines.cutout, None),
        }
      })
      .chain(back_to_front(eye, &centers).into_iter().map(|order| {
        let index = translucent[order];
        (index, &self.pipelines_for(&items[index]).blended, None)
      }));

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

  fn pipelines_for(&self, item: &DrawItem<'_>) -> &Pipelines {
    if item.transform.determinant() < 0.0 {
      &self.mirrored_pipelines
    } else {
      &self.pipelines
    }
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
}

#[cfg(target_arch = "wasm32")]
use winit::window::Window;

use crate::camera::CameraBehavior;

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
      self.camera.eye(),
      &self.camera_bind_group,
      &self.light_bind_group,
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

    self.camera_uniform.update_view_projection(&self.camera);
    queue.write_buffer(&self.camera_buffer, 0, cast_slice(&[self.camera_uniform]));

    self.light_uniform.update_position(self.camera.eye().into());
    queue.write_buffer(&self.light_buffer, 0, cast_slice(&[self.light_uniform]));
  }

  pub fn process_mouse_input(&mut self, state: &ElementState) {
    self.backend.mouse_pressed = state == &ElementState::Pressed;
  }

  pub fn process_mouse_movement(&mut self, delta: (f64, f64)) {
    if !self.backend.mouse_pressed {
      return;
    }

    self.camera.process_mouse_movement(delta);
  }

  pub fn process_mouse_scroll(&mut self, delta: &MouseScrollDelta) {
    if !self.backend.mouse_pressed {
      return;
    }

    match delta {
      MouseScrollDelta::LineDelta(_, y) => self.camera.process_mouse_scroll(*y as f32),
      MouseScrollDelta::PixelDelta(delta) => self.camera.process_mouse_scroll(delta.y as f32),
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

  pub async fn render(&self, items: &[DrawItem<'_>], camera: &Camera) -> Result<Vec<u8>> {
    self
      .render_into(
        items,
        camera,
        self.backend.get_output_texture(),
        &self.depth_texture,
        false,
      )
      .await
  }

  // Renders into textures of its own, at any size the device allows. Unlike `render`, whose skin
  // renders have always kept them premultiplied, partly transparent pixels keep their own color.
  pub async fn render_sized(
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

    self
      .render_into(items, camera, &output_texture, &depth_texture, true)
      .await
  }

  // Renders run on several threads at once, so each gets its own camera and light
  // instead of rewriting the shared ones
  async fn render_into(
    &self,
    items: &[DrawItem<'_>],
    camera: &Camera,
    output_texture: &wgpu::Texture,
    depth_texture: &Texture,
    unpremultiply: bool,
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
      camera.eye(),
      &camera_bind_group,
      &light_bind_group,
      &native::NativeBackend::create_view(&output_texture),
      &depth_texture.view,
    );

    self
      .backend
      .handle_encoder_after_render(encoder, output_texture, unpremultiply)
      .await
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

// Indices of the points from farthest to nearest
fn back_to_front(eye: Point3<f32>, points: &[Point3<f32>]) -> Vec<usize> {
  let mut order: Vec<usize> = (0..points.len()).collect();
  order.sort_by(|&a, &b| {
    eye
      .distance2(points[b])
      .total_cmp(&eye.distance2(points[a]))
  });
  order
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn orders_points_farthest_first() {
    let eye = Point3::new(10.0, 4.0, -2.0);
    let points = [
      Point3::new(10.0, 4.0, 1.0),
      Point3::new(-30.0, 4.0, -2.0),
      Point3::new(10.0, 4.0, -2.0),
      Point3::new(10.0, -6.0, -2.0),
    ];

    assert_eq!(back_to_front(eye, &points), [1, 3, 0, 2]);
    assert_eq!(back_to_front(eye, &[]), Vec::<usize>::new());
  }
}
