use std::collections::HashMap;

use serde_json::Value;

use crate::display::{Display, Transform};
use crate::{Error, Pack};

/// Face directions in 1.8's `EnumFacing` order.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum Direction {
  Down,
  Up,
  North,
  South,
  West,
  East,
}

impl Direction {
  fn from_name(name: &str) -> Option<Self> {
    Some(match name {
      "down" => Self::Down,
      "up" => Self::Up,
      "north" => Self::North,
      "south" => Self::South,
      "west" => Self::West,
      "east" => Self::East,
      _ => return None,
    })
  }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum Axis {
  X,
  Y,
  Z,
}

pub(crate) struct ElementRotation {
  pub origin: [f32; 3],
  pub axis: Axis,
  pub angle: f32,
  pub rescale: bool,
}

pub(crate) struct Face {
  pub direction: Direction,
  pub uv: Option<[f32; 4]>,
  pub texture: String,
  pub quarter_turns: usize,
}

pub(crate) struct Element {
  pub from: [f32; 3],
  pub to: [f32; 3],
  pub rotation: Option<ElementRotation>,
  pub shade: bool,
  pub faces: Vec<Face>,
}

struct ModelFile {
  parent: Option<String>,
  textures: HashMap<String, String>,
  elements: Vec<Element>,
  display: Display,
}

/// A model and its supplied parents, child first.
pub(crate) struct Model {
  chain: Vec<ModelFile>,
}

impl Model {
  pub(crate) fn load(pack: &Pack, name: &str) -> Result<Self, Error> {
    let mut names: Vec<String> = Vec::new();
    let mut chain = Vec::new();
    let mut next = Some(name.to_string());

    while let Some(name) = next {
      // A parent the pack doesn't supply (a vanilla or builtin model) ends the chain
      let Some(text) = pack.models.get(&name) else {
        if chain.is_empty() {
          return Err(Error::MissingModel(name));
        }

        break;
      };

      if names.contains(&name) {
        return Err(Error::InvalidModel {
          name,
          reason: "its parents loop".to_string(),
        });
      }

      let file = parse_model(text).map_err(|reason| Error::InvalidModel {
        name: name.clone(),
        reason,
      })?;

      next = file.parent.clone();
      names.push(name);
      chain.push(file);
    }

    Ok(Self { chain })
  }

  /// 1.8 takes the elements of the nearest model that has any.
  pub(crate) fn elements(&self) -> &[Element] {
    self
      .chain
      .iter()
      .map(|file| file.elements.as_slice())
      .find(|elements| !elements.is_empty())
      .unwrap_or_default()
  }

  pub(crate) fn display(&self) -> Display {
    self
      .chain
      .iter()
      .rev()
      .fold(Display::default(), |parent, file| file.display.or(parent))
  }

  /// Follows `#variable` references the way 1.8 does: each lookup starts again from the child, so a
  /// parent's `"particle": "#side"` picks up the child's `side`. None for an undefined variable or a loop.
  pub(crate) fn resolve_texture(&self, reference: &str) -> Option<String> {
    let mut variable = reference.strip_prefix('#').unwrap_or(reference);
    let hops = self
      .chain
      .iter()
      .map(|file| file.textures.len())
      .sum::<usize>();

    for _ in 0..=hops {
      let value = self
        .chain
        .iter()
        .find_map(|file| file.textures.get(variable))?;

      match value.strip_prefix('#') {
        Some(next) => variable = next,
        None => return Some(strip_namespace(value).to_string()),
      }
    }

    None
  }
}

fn strip_namespace(name: &str) -> &str {
  name.strip_prefix("minecraft:").unwrap_or(name)
}

fn parse_model(text: &str) -> Result<ModelFile, String> {
  let root = crate::parse_json(text)?;

  let parent =
    optional(&root, "parent", Value::as_str)?.map(|parent| strip_namespace(parent).to_string());

  let textures = match root.get("textures") {
    None => HashMap::new(),
    Some(textures) => textures
      .as_object()
      .ok_or("textures is not an object")?
      .iter()
      .map(|(variable, value)| {
        let path = value
          .as_str()
          .ok_or_else(|| format!("texture {variable} is not a string"))?;
        Ok((variable.clone(), path.to_string()))
      })
      .collect::<Result<_, String>>()?,
  };

  let elements = match root.get("elements") {
    None => Vec::new(),
    Some(elements) => elements
      .as_array()
      .ok_or("elements is not an array")?
      .iter()
      .map(parse_element)
      .collect::<Result<_, String>>()?,
  };

  let mut display = Display::default();

  if let Some(contexts) = root.get("display") {
    for (context, value) in contexts.as_object().ok_or("display is not an object")? {
      let slot = match context.as_str() {
        "thirdperson" => &mut display.thirdperson,
        "firstperson" => &mut display.firstperson,
        "head" => &mut display.head,
        "gui" => &mut display.gui,
        "ground" => &mut display.ground,
        "fixed" => &mut display.fixed,
        _ => continue,
      };

      let defaults = Transform::default();

      *slot = Some(Transform {
        rotation: optional(value, "rotation", floats)?.unwrap_or(defaults.rotation),
        translation: optional(value, "translation", floats)?.unwrap_or(defaults.translation),
        scale: optional(value, "scale", floats)?.unwrap_or(defaults.scale),
      });
    }
  }

  Ok(ModelFile {
    parent,
    textures,
    elements,
    display,
  })
}

fn parse_element(element: &Value) -> Result<Element, String> {
  let from = required(element, "from", floats)?;
  let to = required(element, "to", floats)?;

  let rotation = match element.get("rotation") {
    None => None,
    Some(rotation) => Some(ElementRotation {
      origin: required(rotation, "origin", floats)?,
      axis: match required(rotation, "axis", Value::as_str)? {
        "x" => Axis::X,
        "y" => Axis::Y,
        "z" => Axis::Z,
        axis => return Err(format!("unknown rotation axis {axis}")),
      },
      angle: required(rotation, "angle", Value::as_f64)? as f32,
      rescale: optional(rotation, "rescale", Value::as_bool)?.unwrap_or(false),
    }),
  };

  let mut faces = Vec::new();

  for (name, face) in required(element, "faces", Value::as_object)? {
    let direction = Direction::from_name(name).ok_or_else(|| format!("unknown face {name}"))?;

    let quarter_turns = match optional(face, "rotation", Value::as_f64)?.unwrap_or(0.0) {
      0.0 => 0,
      90.0 => 1,
      180.0 => 2,
      270.0 => 3,
      rotation => return Err(format!("face rotation {rotation} is not 0, 90, 180 or 270")),
    };

    faces.push(Face {
      direction,
      uv: optional(face, "uv", floats)?,
      texture: required(face, "texture", Value::as_str)?.to_string(),
      quarter_turns,
    });
  }

  // 1.8 keeps faces in an EnumMap, so they bake in direction order whatever order the file uses
  faces.sort_by_key(|face| face.direction as usize);

  Ok(Element {
    from,
    to,
    rotation,
    shade: optional(element, "shade", Value::as_bool)?.unwrap_or(true),
    faces,
  })
}

fn floats<const N: usize>(value: &Value) -> Option<[f32; N]> {
  let items = value.as_array()?;

  if items.len() != N {
    return None;
  }

  let mut out = [0.0; N];

  for (slot, item) in out.iter_mut().zip(items) {
    *slot = item.as_f64()? as f32;
  }

  Some(out)
}

fn optional<'a, T>(
  object: &'a Value,
  key: &str,
  read: impl Fn(&'a Value) -> Option<T>,
) -> Result<Option<T>, String> {
  object
    .get(key)
    .map(|value| read(value).ok_or_else(|| format!("{key} has the wrong type")))
    .transpose()
}

fn required<'a, T>(
  object: &'a Value,
  key: &str,
  read: impl Fn(&'a Value) -> Option<T>,
) -> Result<T, String> {
  optional(object, key, read)?.ok_or_else(|| format!("{key} is missing"))
}
