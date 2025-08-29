use std::collections::HashMap;

use futures_channel::oneshot;
use once_cell::sync::Lazy;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::{spawn_local, wasm_bindgen};
use winit::dpi::LogicalSize;
use winit::event::{DeviceEvent, Event, MouseButton, WindowEvent};
use winit::event_loop::{ControlFlow, EventLoop, EventLoopWindowTarget};
use winit::platform::web::{EventLoopExtWebSys, WindowBuilderExtWebSys};
use winit::window::{Window, WindowBuilder, WindowId};

use crate::error::{Error, Result};
use crate::model::{Model, ModelKind, ModelOuterLayer};
use crate::renderer::wasm::WasmBackend;
use crate::renderer::SkinRenderer;

// Since the winit EventLoop consumes self, we need a static variable to
// communicate with JavaScript
static mut JS_MESSAGE_QUEUE: Lazy<Vec<JsMessage>> = Lazy::new(Vec::new);

// Basic events that can be triggered from JavaScript
enum JsMessage {
  RegisterCanvas(String),
  RenderSkin { canvas_id: String, model: JsModel },
  UnregisterCanvas(String),
}

#[wasm_bindgen(js_name = SkinMessenger)]
pub struct JsMessenger;

// Modifying JS_MESSAGE_QUEUE is marked as unsafe because we are accessing a
// mutable static variable This is safe since we are only accessing this in a
// single thread and we are only making 1 mutable reference at a time

#[wasm_bindgen(js_class = SkinMessenger)]
impl JsMessenger {
  #[wasm_bindgen(js_name = registerCanvas)]
  pub fn register_canvas(canvas_id: String) {
    unsafe { JS_MESSAGE_QUEUE.push(JsMessage::RegisterCanvas(canvas_id)) };
  }

  #[wasm_bindgen(js_name = renderSkin)]
  pub fn render_skin(canvas_id: String, bytes: Vec<u8>, slim: bool, extruded: bool) {
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

    unsafe {
      JS_MESSAGE_QUEUE.push(JsMessage::RenderSkin {
        canvas_id,
        model: JsModel {
          bytes,
          model_kind,
          model_outer_layer,
        },
      })
    };
  }

  #[wasm_bindgen(js_name = unregisterCanvas)]
  pub fn unregister_canvas(canvas_id: String) {
    unsafe { JS_MESSAGE_QUEUE.push(JsMessage::UnregisterCanvas(canvas_id)) };
  }
}

struct JsModel {
  bytes: Vec<u8>,
  model_kind: ModelKind,
  model_outer_layer: ModelOuterLayer,
}

#[wasm_bindgen(js_name = SkinRenderer)]
pub struct JsSkinRenderer {
  event_loop: EventLoop<()>,
}

#[wasm_bindgen(js_class = SkinRenderer)]
impl JsSkinRenderer {
  #[wasm_bindgen(constructor)]
  pub fn new() -> Self {
    Self {
      event_loop: EventLoop::new().unwrap(),
    }
  }

  pub fn run(self) {
    let mut receivers = HashMap::<WindowId, oneshot::Receiver<SkinRenderer<WasmBackend>>>::new();
    let mut renderers = HashMap::<WindowId, SkinRenderer<WasmBackend>>::new();
    let mut window_ids = HashMap::<String, WindowId>::new();
    let mut staged_models = HashMap::<WindowId, JsModel>::new();
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
      let messages = unsafe { JS_MESSAGE_QUEUE.drain(0..) };

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
          JsMessage::RenderSkin { canvas_id, model } => {
            let Some(window_id) = window_ids.get(&canvas_id) else {
              continue;
            };

            // If the renderer is not ready, stage the model and wait for the renderer to be
            // ready
            let Some(renderer) = renderers.get(window_id) else {
              staged_models.insert(*window_id, model);
              continue;
            };

            if let Ok(model) =
              renderer.load_skin(&model.bytes, model.model_kind, model.model_outer_layer)
            {
              models.insert(*window_id, model);
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
        Ok(Some(renderer)) => {
          if let Some(model) = staged_models.remove(window_id).and_then(|model| {
            renderer
              .load_skin(&model.bytes, model.model_kind, model.model_outer_layer)
              .ok()
          }) {
            models.insert(*window_id, model);
          }

          renderers.insert(*window_id, renderer);

          false
        }
        Err(_) => {
          staged_models.remove(window_id);
          false
        }
        _ => true,
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
            WindowEvent::Resized(size) => renderer.resize(*size),
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

impl Default for JsSkinRenderer {
  fn default() -> Self {
    Self::new()
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
    .with_decorations(false)
    .with_transparent(true)
    .build(window_target)?;

  Ok(window)
}

fn send_renderer(window: Window, tx: oneshot::Sender<SkinRenderer<WasmBackend>>) {
  spawn_local(async move {
    if let Ok(renderer) = SkinRenderer::new(window).await {
      let _ = tx.send(renderer);
    };
  });
}

#[wasm_bindgen(start)]
pub fn start() {
  console_error_panic_hook::set_once();
  tracing_wasm::set_as_global_default();
}
