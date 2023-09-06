use crate::buffer_dimensions::BufferDimensions;
use crate::camera::{Camera, CameraUniform};
use crate::error::SkinRendererError;
use crate::error::SkinRendererResult;
use crate::instance::{Instance, InstanceRaw};
use crate::light::LightUniform;
use crate::model::{DrawModel, Material, Model, ModelVertex, Vertex};
use crate::resources::load_model;
use crate::skin_loader::SkinLoader;
use crate::texture::Texture;
use bytemuck::cast_slice;
use futures_intrusive::channel;
use image::{ImageBuffer, Rgba};
use std::io::{BufWriter, Cursor};
use wgpu::util::DeviceExt;

pub enum SkinModelType {
  Classic,
  Slim,
}

pub struct SkinRenderer {
  dimensions: BufferDimensions,

  device: wgpu::Device,
  queue: wgpu::Queue,

  camera_bind_group: wgpu::BindGroup,
  light_bind_group: wgpu::BindGroup,
  render_pipeline: wgpu::RenderPipeline,
  instance_buffer: wgpu::Buffer,

  classic_model: Model,
  slim_model: Model,

  depth_texture: Texture,
  texture: wgpu::Texture,
  texture_extent: wgpu::Extent3d,
  texture_bind_group_layout: wgpu::BindGroupLayout,

  loader: SkinLoader,
}

impl SkinRenderer {
  pub async fn new(width: u32, height: u32) -> SkinRendererResult<Self> {
    let backends = wgpu::util::backend_bits_from_env().unwrap_or_else(wgpu::Backends::all);
    let dx12_shader_compiler = wgpu::util::dx12_shader_compiler_from_env().unwrap_or_default();

    let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
      backends,
      dx12_shader_compiler,
    });

    let adapter = instance
      .request_adapter(&wgpu::RequestAdapterOptions::default())
      .await
      .unwrap();

    let (device, queue) = adapter
      .request_device(
        &wgpu::DeviceDescriptor {
          label: None,
          features: wgpu::Features::empty(),
          limits: wgpu::Limits::downlevel_defaults(),
        },
        None,
      )
      .await
      .unwrap();

    let dimensions = BufferDimensions::new(width, height);

    let texture_extent = wgpu::Extent3d {
      width: dimensions.width,
      height: dimensions.height,
      depth_or_array_layers: 1,
    };

    let texture = device.create_texture(&wgpu::TextureDescriptor {
      label: None,
      size: texture_extent,
      mip_level_count: 1,
      sample_count: 1,
      dimension: wgpu::TextureDimension::D2,
      format: wgpu::TextureFormat::Rgba8UnormSrgb,
      usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
      view_formats: &[],
    });

    let config = wgpu::SurfaceConfiguration {
      usage: wgpu::TextureUsages::empty(),
      format: texture.format(),
      width: dimensions.width,
      height: dimensions.height,
      present_mode: wgpu::PresentMode::default(),
      alpha_mode: wgpu::CompositeAlphaMode::default(),
      view_formats: vec![],
    };

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

    let camera = Camera::new(config.width as f32, config.height as f32);
    let camera_uniform = CameraUniform::new(&camera);

    let camera_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Camera Buffer"),
      contents: cast_slice(&[camera_uniform]),
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    });

    let instance = Instance::default();
    let instance_data = [instance].iter().map(Instance::to_raw).collect::<Vec<_>>();

    let instance_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Instance Buffer"),
      contents: cast_slice(&instance_data),
      usage: wgpu::BufferUsages::VERTEX,
    });

    let camera_bind_group_layout =
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
        label: Some("camera_bind_group_layout"),
      });

    let camera_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      layout: &camera_bind_group_layout,
      entries: &[wgpu::BindGroupEntry {
        binding: 0,
        resource: camera_buffer.as_entire_binding(),
      }],
      label: Some("camera_bind_group"),
    });

    let light_uniform = LightUniform::default();

    let light_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some("Light VB"),
      contents: bytemuck::cast_slice(&[light_uniform]),
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    });

    let light_bind_group_layout =
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
        label: None,
      });

    let light_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      layout: &light_bind_group_layout,
      entries: &[wgpu::BindGroupEntry {
        binding: 0,
        resource: light_buffer.as_entire_binding(),
      }],
      label: None,
    });

    let render_pipeline = {
      let shader = wgpu::ShaderModuleDescriptor {
        label: Some("shader.wgsl"),
        source: wgpu::ShaderSource::Wgsl(include_str!("shader.wgsl").into()),
      };

      let layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: Some("Render Pipeline Layout"),
        bind_group_layouts: &[
          &texture_bind_group_layout,
          &camera_bind_group_layout,
          &light_bind_group_layout,
        ],
        push_constant_ranges: &[],
      });

      Self::create_render_pipeline(&device, &layout, &config, shader)
    };

    let depth_texture = Texture::create_depth_texture(&device, &config, "depth_texture");

    let (classic_model, slim_model) = tokio::join!(
      load_model("classic.obj", &device, &queue, &texture_bind_group_layout),
      load_model("slim.obj", &device, &queue, &texture_bind_group_layout)
    );

    let classic_model = classic_model?;
    let slim_model = slim_model?;

    Ok(Self {
      device,
      queue,

      dimensions,
      camera_bind_group,
      light_bind_group,
      render_pipeline,
      instance_buffer,

      classic_model,
      slim_model,

      depth_texture,
      texture,
      texture_extent,
      texture_bind_group_layout,

      loader: SkinLoader::new(),
    })
  }

  pub async fn render(
    &self,
    model_type: SkinModelType,
    model_texture_url: &str,
  ) -> SkinRendererResult<Vec<u8>> {
    let model_texture_image = self.loader.get_skin(model_texture_url).await?;
    let model_texture = Texture::from_image(&self.device, &self.queue, &model_texture_image)?;
    let material = Material::new(&self.device, model_texture, &self.texture_bind_group_layout);

    self.render_material(model_type, &material).await
  }

  pub async fn render_default_texture(
    &self,
    model_type: SkinModelType,
  ) -> SkinRendererResult<Vec<u8>> {
    let material = match model_type {
      SkinModelType::Classic => self.classic_model.materials.get(0),
      SkinModelType::Slim => self.slim_model.materials.get(0),
    };

    self.render_material(model_type, material.unwrap()).await
  }

  fn create_render_pipeline(
    device: &wgpu::Device,
    layout: &wgpu::PipelineLayout,
    config: &wgpu::SurfaceConfiguration,
    shader: wgpu::ShaderModuleDescriptor,
  ) -> wgpu::RenderPipeline {
    let shader = device.create_shader_module(shader);

    device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
      label: Some("Render Pipeline"),
      layout: Some(layout),
      vertex: wgpu::VertexState {
        module: &shader,
        entry_point: "vs_main",
        buffers: &[ModelVertex::desc(), InstanceRaw::desc()],
      },
      fragment: Some(wgpu::FragmentState {
        module: &shader,
        entry_point: "fs_main",
        targets: &[Some(wgpu::ColorTargetState {
          format: config.format,
          blend: Some(wgpu::BlendState::ALPHA_BLENDING),
          write_mask: wgpu::ColorWrites::ALL,
        })],
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
        depth_compare: wgpu::CompareFunction::Less,
        stencil: wgpu::StencilState::default(),
        bias: wgpu::DepthBiasState::default(),
      }),
      multisample: wgpu::MultisampleState {
        count: 1,
        mask: !0,
        alpha_to_coverage_enabled: false,
      },
      multiview: None,
    })
  }

  async fn render_material(
    &self,
    model_type: SkinModelType,
    material: &Material,
  ) -> SkinRendererResult<Vec<u8>> {
    let model = match model_type {
      SkinModelType::Classic => &self.classic_model,
      SkinModelType::Slim => &self.slim_model,
    };

    let output_buffer = self.device.create_buffer(&wgpu::BufferDescriptor {
      label: None,
      size: (self.dimensions.padded_bytes_per_row * self.dimensions.height) as u64,
      usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    let command_buffer = {
      let view = self
        .texture
        .create_view(&wgpu::TextureViewDescriptor::default());

      let mut encoder = self
        .device
        .create_command_encoder(&wgpu::CommandEncoderDescriptor {
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
              store: true,
            },
          })],
          depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
            view: &self.depth_texture.view,
            depth_ops: Some(wgpu::Operations {
              load: wgpu::LoadOp::Clear(1.0),
              store: true,
            }),
            stencil_ops: None,
          }),
        });

        render_pass.set_vertex_buffer(1, self.instance_buffer.slice(..));
        render_pass.set_pipeline(&self.render_pipeline);
        render_pass.draw_model(
          model,
          material,
          &self.camera_bind_group,
          &self.light_bind_group,
        );
      }

      encoder.copy_texture_to_buffer(
        self.texture.as_image_copy(),
        wgpu::ImageCopyBuffer {
          buffer: &output_buffer,
          layout: wgpu::ImageDataLayout {
            offset: 0,
            bytes_per_row: Some(self.dimensions.padded_bytes_per_row),
            rows_per_image: Some(self.dimensions.height),
          },
        },
        self.texture_extent,
      );

      encoder.finish()
    };

    let index = self.queue.submit(Some(command_buffer));

    let buffer_slice = output_buffer.slice(..);
    let (sender, receiver) = channel::shared::oneshot_channel();
    buffer_slice.map_async(wgpu::MapMode::Read, move |v| sender.send(v).unwrap());

    self
      .device
      .poll(wgpu::Maintain::WaitForSubmissionIndex(index));

    if let Some(Ok(())) = receiver.receive().await {
      let padded_buffer = buffer_slice.get_mapped_range();

      let buffer = padded_buffer
        .chunks(self.dimensions.padded_bytes_per_row as usize)
        .take(self.dimensions.height as usize)
        .flat_map(|row| &row[..self.dimensions.unpadded_bytes_per_row as usize])
        .copied()
        .collect::<Vec<u8>>();

      let image =
        ImageBuffer::<Rgba<u8>, _>::from_vec(self.dimensions.width, self.dimensions.height, buffer)
          .expect("Failed to create image buffer");

      let mut writer = BufWriter::new(Cursor::new(Vec::new()));

      image.write_to(&mut writer, image::ImageOutputFormat::Png)?;

      let bytes = writer.into_inner().unwrap().into_inner();

      Ok(bytes)
    } else {
      Err(SkinRendererError::RenderFailure)
    }
  }
}
