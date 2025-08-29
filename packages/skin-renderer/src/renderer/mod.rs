mod backend;
#[cfg(not(target_arch = "wasm32"))]
pub mod native;
#[cfg(target_arch = "wasm32")]
pub mod wasm;

use bytemuck::cast_slice;
use wgpu::util::DeviceExt;
#[cfg(target_arch = "wasm32")]
use winit::dpi::PhysicalSize;
#[cfg(target_arch = "wasm32")]
use winit::event::{ElementState, MouseScrollDelta};

use self::backend::{Backend, OutputTexture};
use crate::camera::{Camera, CameraUniform, OrbitalCamera};
use crate::error::Result;
use crate::geometry::vertex::{Vertex, VertexDescriptor};
use crate::instance::InstanceRaw;
use crate::light::LightUniform;
use crate::model::{DrawModel, Model, ModelKind, ModelOuterLayer};
use crate::skin_loader::load_skin_from_memory;
use crate::texture::Texture;

#[cfg(not(target_arch = "wasm32"))]
pub type SkinRender = Vec<u8>;

pub struct SkinRenderer<T: Backend> {
  backend: T,
  config: wgpu::SurfaceConfiguration,

  texture_bind_group_layout: wgpu::BindGroupLayout,

  camera: Camera,
  camera_uniform: CameraUniform,
  camera_buffer: wgpu::Buffer,

  light_uniform: LightUniform,
  light_buffer: wgpu::Buffer,

  camera_bind_group: wgpu::BindGroup,
  light_bind_group: wgpu::BindGroup,
  render_pipeline: wgpu::RenderPipeline,
  instance_buffer: wgpu::Buffer,

  depth_texture: Texture,
}

impl<T: Backend> SkinRenderer<T> {
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

    let instance_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Instance Buffer"),
      contents: cast_slice(&[Model::to_raw()]),
      usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST,
    });

    let (camera, camera_uniform, camera_buffer, camera_bind_group_layout, camera_bind_group) =
      Self::create_camera(device, &config);

    let (light_uniform, light_buffer, light_bind_group_layout, light_bind_group) =
      Self::create_light(device, &camera);

    let render_pipeline = Self::create_render_pipeline(
      device,
      &[
        &texture_bind_group_layout,
        &camera_bind_group_layout,
        &light_bind_group_layout,
      ],
      &config,
    );

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

      camera_bind_group,
      light_bind_group,
      render_pipeline,
      instance_buffer,

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
    bind_group_layouts: &[&wgpu::BindGroupLayout],
    config: &wgpu::SurfaceConfiguration,
  ) -> wgpu::RenderPipeline {
    let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
      label: Some("shader.wgsl"),
      source: wgpu::ShaderSource::Wgsl(include_str!("shader.wgsl").into()),
    });

    let layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
      label: Some("Render Pipeline Layout"),
      bind_group_layouts,
      push_constant_ranges: &[],
    });

    device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
      label: Some("Render Pipeline"),
      layout: Some(&layout),
      vertex: wgpu::VertexState {
        module: &shader,
        entry_point: Some("vs_main"),
        buffers: &[Vertex::descriptor(), InstanceRaw::descriptor()],
        compilation_options: wgpu::PipelineCompilationOptions::default(),
      },
      fragment: Some(wgpu::FragmentState {
        module: &shader,
        entry_point: Some("fs_main"),
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
        depth_write_enabled: true,
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

  fn render_sync(&self, model: &Model) -> (wgpu::CommandEncoder, OutputTexture) {
    let device = self.backend.device();
    let output_texture = self.backend.get_output_texture();
    let view = T::create_view(&output_texture);

    let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
      label: Some("Render Encoder"),
    });

    {
      let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
        label: Some("Render Pass"),
        color_attachments: &[Some(wgpu::RenderPassColorAttachment {
          view: &view,
          resolve_target: None,
          ops: wgpu::Operations {
            load: wgpu::LoadOp::Clear(wgpu::Color::TRANSPARENT),
            store: wgpu::StoreOp::Store,
          },
        })],
        depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
          view: &self.depth_texture.view,
          depth_ops: Some(wgpu::Operations {
            load: wgpu::LoadOp::Clear(1.0),
            store: wgpu::StoreOp::Store,
          }),
          stencil_ops: None,
        }),
        occlusion_query_set: None,
        timestamp_writes: None,
      });

      render_pass.set_vertex_buffer(1, self.instance_buffer.slice(..));
      render_pass.set_pipeline(&self.render_pipeline);
      render_pass.draw_model(model, &self.camera_bind_group, &self.light_bind_group);
    };

    (encoder, output_texture)
  }

  pub fn load_skin(
    &self,
    skin: &[u8],
    model_kind: ModelKind,
    model_outer_layer: ModelOuterLayer,
  ) -> Result<Model> {
    Ok(Model::new(
      self.backend.device(),
      self.backend.queue(),
      &self.texture_bind_group_layout,
      load_skin_from_memory(skin)?,
      model_kind,
      model_outer_layer,
    ))
  }
}

#[cfg(target_arch = "wasm32")]
use winit::window::Window;

#[cfg(target_arch = "wasm32")]
use crate::camera::CameraBehavior;

#[cfg(target_arch = "wasm32")]
impl SkinRenderer<wasm::WasmBackend> {
  pub async fn new(window: Window) -> Result<Self> {
    let backend = wasm::WasmBackend::new(window).await?;
    Self::create(backend).await
  }

  pub fn render(&self, model: &Model) {
    let (encoder, output_texture) = self.render_sync(model);

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
impl SkinRenderer<native::NativeBackend> {
  pub async fn new(width: u32, height: u32) -> Result<Self> {
    let backend = native::NativeBackend::new(width, height).await?;
    Self::create(backend).await
  }

  pub async fn render(&self, model: &Model) -> Result<SkinRender> {
    let (encoder, _) = self.render_sync(model);
    self.backend.handle_encoder_after_render(encoder).await
  }
}
