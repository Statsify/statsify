use std::cell::RefCell;
use std::collections::HashMap;

use futures_channel::oneshot;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::{future_to_promise, js_sys, spawn_local, wasm_bindgen};
use winit::dpi::LogicalSize;
use winit::event::{DeviceEvent, Event, MouseButton, WindowEvent};
use winit::event_loop::{ControlFlow, EventLoop, EventLoopWindowTarget};
use winit::platform::web::{EventLoopExtWebSys, WindowBuilderExtWebSys};
use winit::window::{Window, WindowBuilder, WindowId};

use crate::armor::Armor;
use crate::error::{Error, Result};
use crate::model::{Model, ModelKind, ModelOuterLayer};
use crate::pose::Pose;
use crate::renderer::wasm::WasmBackend;
use crate::renderer::SkinRenderer;

thread_local! {
  // The winit event loop owns itself once it runs, so JavaScript's calls wait here for
  // its next turn
  static JS_MESSAGE_QUEUE: RefCell<Vec<JsMessage>> = const { RefCell::new(Vec::new()) };
}

fn send(message: JsMessage) {
  JS_MESSAGE_QUEUE.with_borrow_mut(|queue| queue.push(message));
}

type Loaded = oneshot::Sender<std::result::Result<(), JsError>>;

// Basic events that can be triggered from JavaScript
enum JsMessage {
  RegisterCanvas(String),
  RenderSkin {
    canvas_id: String,
    model: JsModel,
    loaded: Loaded,
  },
  SetYaw {
    canvas_id: String,
    yaw: f32,
  },
  UnregisterCanvas(String),
}

#[wasm_bindgen(js_name = SkinMessenger)]
pub struct JsMessenger;

#[wasm_bindgen(js_class = SkinMessenger)]
impl JsMessenger {
  #[wasm_bindgen(js_name = registerCanvas)]
  pub fn register_canvas(canvas_id: String) {
    send(JsMessage::RegisterCanvas(canvas_id));
  }

  /// Resolves once the skin is loaded onto the canvas, and rejects when it can't be drawn:
  /// a bad texture, or a browser with neither WebGPU nor WebGL.
  #[wasm_bindgen(js_name = renderSkin, unchecked_return_type = "Promise<void>")]
  pub fn render_skin(
    canvas_id: String,
    bytes: Vec<u8>,
    slim: bool,
    extruded: bool,
    options: Option<RenderOptions>,
  ) -> js_sys::Promise {
    let (loaded, rx) = oneshot::channel();

    match JsModel::new(bytes, slim, extruded, options) {
      Ok(model) => send(JsMessage::RenderSkin {
        canvas_id,
        model,
        loaded,
      }),
      Err(error) => {
        let _ = loaded.send(Err(error));
      }
    }

    future_to_promise(async move {
      match rx.await {
        Ok(result) => result.map(|()| JsValue::UNDEFINED).map_err(JsValue::from),
        Err(_) => Err(JsError::new("The canvas was rendered again or unregistered").into()),
      }
    })
  }

  /// Turns the camera to `yaw` radians around the player.
  #[wasm_bindgen(js_name = setYaw)]
  pub fn set_yaw(canvas_id: String, yaw: f64) -> std::result::Result<(), JsError> {
    send(JsMessage::SetYaw {
      canvas_id,
      yaw: finite_yaw(yaw)?,
    });

    Ok(())
  }

  #[wasm_bindgen(js_name = unregisterCanvas)]
  pub fn unregister_canvas(canvas_id: String) {
    send(JsMessage::UnregisterCanvas(canvas_id));
  }
}

// Checked after narrowing, since a huge f64 becomes an f32 infinity
fn finite_yaw(yaw: f64) -> Result<f32> {
  let yaw = yaw as f32;

  if yaw.is_finite() {
    Ok(yaw)
  } else {
    Err(Error::InvalidYaw)
  }
}

struct JsModel {
  bytes: Vec<u8>,
  model_kind: ModelKind,
  model_outer_layer: ModelOuterLayer,
  cape: Option<Vec<u8>>,
  yaw: Option<f32>,
  pose: Pose,
}

impl JsModel {
  fn new(
    bytes: Vec<u8>,
    slim: bool,
    extruded: bool,
    options: Option<RenderOptions>,
  ) -> std::result::Result<Self, JsError> {
    let model_kind = if slim {
      ModelKind::Slim
    } else {
      ModelKind::Classic
    };

    let model_outer_layer = if extruded {
      ModelOuterLayer::D3
    } else {
      ModelOuterLayer::D2
    };

    let (cape, yaw, pose) = match options {
      Some(options) => (
        options.cape(),
        options.yaw().map(finite_yaw).transpose()?,
        options
          .pose()
          .map(|pose| {
            pose
              .parse()
              .map_err(|_| JsError::new(&format!("Unknown pose: {pose}")))
          })
          .transpose()?,
      ),
      None => (None, None, None),
    };

    Ok(Self {
      bytes,
      model_kind,
      model_outer_layer,
      cape,
      yaw,
      pose: pose.unwrap_or_default(),
    })
  }

  fn load(self, renderer: &mut SkinRenderer<WasmBackend>) -> Result<Model> {
    let model = renderer.load_skin(
      &self.bytes,
      self.model_kind,
      self.model_outer_layer,
      &Armor::default(),
      None,
      self.cape.as_deref(),
      self.pose,
    )?;

    if let Some(yaw) = self.yaw {
      renderer.set_yaw(yaw);
    }

    renderer.frame(&model);

    Ok(model)
  }
}

// Shaped like the native renderer's options, which armour and its glint can join later.
// The package's wasm.d.ts repeats the public API for typechecks that run before a build.
#[wasm_bindgen(typescript_custom_section)]
const RENDER_OPTIONS: &str = r#"
export interface RenderOptions {
  /** Cape texture (PNG). */
  cape?: Uint8Array;
  /** Camera angle around the player in radians: 0 faces the front, π the back. Defaults to -0.3. */
  yaw?: number;
  pose?: "standing" | "punch" | "sneak" | "jump" | "swim" | "fly";
}
"#;

#[wasm_bindgen]
extern "C" {
  #[wasm_bindgen(typescript_type = "RenderOptions")]
  pub type RenderOptions;

  #[wasm_bindgen(method, getter)]
  fn cape(this: &RenderOptions) -> Option<Vec<u8>>;

  #[wasm_bindgen(method, getter)]
  fn yaw(this: &RenderOptions) -> Option<f64>;

  #[wasm_bindgen(method, getter)]
  fn pose(this: &RenderOptions) -> Option<String>;
}

type RendererResult = Result<SkinRenderer<WasmBackend>>;

#[wasm_bindgen(js_name = SkinRenderer)]
pub struct JsSkinRenderer {
  event_loop: EventLoop<()>,
}

#[wasm_bindgen(js_class = SkinRenderer)]
impl JsSkinRenderer {
  /// Throws when the page already has an event loop, since winit allows one.
  #[wasm_bindgen(constructor)]
  pub fn new() -> std::result::Result<JsSkinRenderer, JsError> {
    Ok(Self {
      event_loop: EventLoop::new()?,
    })
  }

  pub fn run(self) {
    let mut receivers = HashMap::<WindowId, oneshot::Receiver<RendererResult>>::new();
    let mut renderers = HashMap::<WindowId, SkinRenderer<WasmBackend>>::new();
    let mut window_ids = HashMap::<String, WindowId>::new();
    let mut staged_models = HashMap::<WindowId, (JsModel, Loaded)>::new();
    let mut models = HashMap::<WindowId, Model>::new();

    self.event_loop.spawn(move |event, window_target| {
      // If there are no renderers or there are receivers we should poll the event
      // loop to avoid missing messages
      if renderers.is_empty() || !receivers.is_empty() {
        window_target.set_control_flow(ControlFlow::Poll);
      } else {
        // If there are renderers and no receivers we can wait for messages since events
        // will be sent with the next frame
        window_target.set_control_flow(ControlFlow::Wait);
      }

      // Drain the message queue and process each message
      let messages = JS_MESSAGE_QUEUE.take();

      for message in messages {
        match message {
          JsMessage::RegisterCanvas(canvas_id) => {
            let Ok(window) = create_window(&canvas_id, window_target) else {
              continue;
            };

            // Creating a renderer is an async operation which cannot be performed within
            // the event loop. We need to create a oneshot channel to communicate with the
            // polling of this future
            let (tx, rx) = oneshot::channel();

            receivers.insert(window.id(), rx);
            window_ids.insert(canvas_id, window.id());
            send_renderer(window, tx);
          }
          JsMessage::RenderSkin {
            canvas_id,
            model,
            loaded,
          } => {
            let Some(window_id) = window_ids.get(&canvas_id) else {
              let _ = loaded.send(Err(Error::CanvasNotFound.into()));
              continue;
            };

            // If the renderer is not ready, stage the model and wait for the renderer to be
            // ready
            let Some(renderer) = renderers.get_mut(window_id) else {
              staged_models.insert(*window_id, (model, loaded));
              continue;
            };

            let result = model.load(renderer).map(|model| {
              models.insert(*window_id, model);
            });

            let _ = loaded.send(result.map_err(JsError::from));
          }
          JsMessage::SetYaw { canvas_id, yaw } => {
            let Some(window_id) = window_ids.get(&canvas_id) else {
              continue;
            };

            if let Some(renderer) = renderers.get_mut(window_id) {
              renderer.set_yaw(yaw);
            } else if let Some((model, _)) = staged_models.get_mut(window_id) {
              model.yaw = Some(yaw);
            }
          }
          JsMessage::UnregisterCanvas(canvas_id) => {
            window_ids.remove(&canvas_id).inspect(|window_id| {
              renderers.remove(window_id);
              receivers.remove(window_id);
              staged_models.remove(window_id);
              models.remove(window_id);
            });
          }
        }
      }

      // Poll the receivers to see if any renderers are ready. If a renderer is ready
      // we can remove the receiver and check for any staged models
      receivers.retain(|window_id, rx| match rx.try_recv() {
        Ok(Some(Ok(mut renderer))) => {
          // The window's resizes before now went to no renderer, and the size it was built
          // with may be from before the browser laid the canvas out
          let size = renderer.window().inner_size();
          renderer.resize(size);

          if let Some((model, loaded)) = staged_models.remove(window_id) {
            let result = model.load(&mut renderer).map(|model| {
              models.insert(*window_id, model);
            });

            let _ = loaded.send(result.map_err(JsError::from));
          }

          renderers.insert(*window_id, renderer);

          false
        }
        Ok(Some(Err(error))) => {
          // Later renders to this canvas fail as unregistered
          window_ids.retain(|_, id| id != window_id);

          if let Some((_, loaded)) = staged_models.remove(window_id) {
            let _ = loaded.send(Err(error.into()));
          }

          false
        }
        Err(_) => {
          staged_models.remove(window_id);
          false
        }
        Ok(None) => true,
      });

      match event {
        Event::AboutToWait => renderers
          .iter()
          .for_each(|(_, renderer)| renderer.window().request_redraw()),
        Event::WindowEvent {
          ref event,
          window_id,
        } => {
          let Some(renderer) = renderers.get_mut(&window_id) else {
            return;
          };

          match event {
            WindowEvent::CloseRequested => {
              renderers.remove(&window_id);
              models.remove(&window_id);
            }
            WindowEvent::MouseInput {
              state,
              button: MouseButton::Left,
              ..
            } => renderer.process_mouse_input(state),
            WindowEvent::MouseWheel { delta, .. } => renderer.process_mouse_scroll(delta),
            WindowEvent::Resized(size) => {
              renderer.resize(*size);

              if let Some(model) = models.get(&window_id) {
                renderer.frame(model);
              }
            }
            WindowEvent::RedrawRequested => {
              if let Some((renderer, model)) =
                renderers.get_mut(&window_id).zip(models.get(&window_id))
              {
                renderer.update();
                renderer.render(model);
              }
            }
            _ => {}
          };
        }
        Event::DeviceEvent {
          event: DeviceEvent::MouseMotion { delta },
          ..
        } => {
          renderers
            .iter_mut()
            .for_each(|(_, renderer)| renderer.process_mouse_movement(delta));
        }
        _ => {}
      }
    });
  }
}

fn create_window(canvas_id: &str, window_target: &EventLoopWindowTarget<()>) -> Result<Window> {
  let canvas: web_sys::HtmlCanvasElement = web_sys::window()
    .and_then(|window| window.document())
    .and_then(|document| document.get_element_by_id(canvas_id))
    .and_then(|canvas| canvas.dyn_into::<web_sys::HtmlCanvasElement>().ok())
    .ok_or(Error::CanvasNotFound)?;

  let window = WindowBuilder::new()
    .with_inner_size(LogicalSize::new(
      canvas.width() as f64,
      canvas.height() as f64,
    ))
    .with_canvas(Some(canvas))
    // The page around the canvas takes the keyboard, so the canvas is no tab stop of its own
    .with_focusable(false)
    .with_decorations(false)
    .with_transparent(true)
    .build(window_target)?;

  Ok(window)
}

fn send_renderer(window: Window, tx: oneshot::Sender<RendererResult>) {
  spawn_local(async move {
    let _ = tx.send(SkinRenderer::new(window).await);
  });
}

#[wasm_bindgen(start)]
pub fn start() {
  console_error_panic_hook::set_once();
  tracing_wasm::set_as_global_default();
}
