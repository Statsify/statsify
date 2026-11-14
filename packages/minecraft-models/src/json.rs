// Minecraft reads pack JSON through Gson's lenient mode, and packs rely on it: `.mcmeta` frame
// lists with trailing commas are common. This reader accepts trailing commas and is otherwise strict.

const MAX_DEPTH: usize = 64;

#[derive(Clone, Debug, PartialEq)]
pub(crate) enum Value {
  Null,
  Bool(bool),
  Number(f64),
  String(String),
  Array(Vec<Value>),
  Object(Vec<(String, Value)>),
}

impl Value {
  pub(crate) fn get(&self, key: &str) -> Option<&Value> {
    match self {
      // Gson keeps the last of repeated keys
      Value::Object(members) => members
        .iter()
        .rev()
        .find(|(name, _)| name == key)
        .map(|(_, value)| value),
      _ => None,
    }
  }

  pub(crate) fn as_f64(&self) -> Option<f64> {
    match self {
      Value::Number(number) => Some(*number),
      _ => None,
    }
  }

  pub(crate) fn as_bool(&self) -> Option<bool> {
    match self {
      Value::Bool(value) => Some(*value),
      _ => None,
    }
  }

  pub(crate) fn as_str(&self) -> Option<&str> {
    match self {
      Value::String(value) => Some(value),
      _ => None,
    }
  }

  pub(crate) fn as_array(&self) -> Option<&[Value]> {
    match self {
      Value::Array(items) => Some(items),
      _ => None,
    }
  }

  pub(crate) fn as_object(&self) -> Option<&[(String, Value)]> {
    match self {
      Value::Object(members) => Some(members),
      _ => None,
    }
  }
}

pub(crate) fn parse(text: &str) -> Result<Value, String> {
  let mut parser = Parser { text, pos: 0 };
  let value = parser.value(0)?;
  parser.skip_whitespace();

  if parser.pos < text.len() {
    return Err(parser.error("unexpected text after the value"));
  }

  Ok(value)
}

struct Parser<'a> {
  text: &'a str,
  pos: usize,
}

impl Parser<'_> {
  fn value(&mut self, depth: usize) -> Result<Value, String> {
    if depth > MAX_DEPTH {
      return Err(self.error("nested too deeply"));
    }

    self.skip_whitespace();

    match self.peek() {
      Some(b'{') => self.object(depth),
      Some(b'[') => self.array(depth),
      Some(b'"') => self.string().map(Value::String),
      Some(b't') => self.literal("true", Value::Bool(true)),
      Some(b'f') => self.literal("false", Value::Bool(false)),
      Some(b'n') => self.literal("null", Value::Null),
      Some(b'-' | b'0'..=b'9') => self.number(),
      _ => Err(self.error("expected a value")),
    }
  }

  fn object(&mut self, depth: usize) -> Result<Value, String> {
    self.pos += 1;
    let mut members = Vec::new();

    loop {
      self.skip_whitespace();

      if self.eat(b'}') {
        return Ok(Value::Object(members));
      }

      if self.peek() != Some(b'"') {
        return Err(self.error("expected a key"));
      }

      let key = self.string()?;
      self.skip_whitespace();

      if !self.eat(b':') {
        return Err(self.error("expected ':'"));
      }

      members.push((key, self.value(depth + 1)?));
      self.skip_whitespace();

      if !self.eat(b',') {
        return if self.eat(b'}') {
          Ok(Value::Object(members))
        } else {
          Err(self.error("expected ',' or '}'"))
        };
      }
    }
  }

  fn array(&mut self, depth: usize) -> Result<Value, String> {
    self.pos += 1;
    let mut items = Vec::new();

    loop {
      self.skip_whitespace();

      if self.eat(b']') {
        return Ok(Value::Array(items));
      }

      items.push(self.value(depth + 1)?);
      self.skip_whitespace();

      if !self.eat(b',') {
        return if self.eat(b']') {
          Ok(Value::Array(items))
        } else {
          Err(self.error("expected ',' or ']'"))
        };
      }
    }
  }

  fn string(&mut self) -> Result<String, String> {
    self.pos += 1;
    let mut out = String::new();

    loop {
      let start = self.pos;

      while !matches!(self.peek(), None | Some(b'"' | b'\\')) {
        self.pos += 1;
      }

      out.push_str(&self.text[start..self.pos]);

      match self.peek() {
        None => return Err(self.error("unterminated string")),
        Some(b'"') => {
          self.pos += 1;
          return Ok(out);
        }
        Some(_) => {
          self.pos += 1;
          let escape = self
            .peek()
            .ok_or_else(|| self.error("unterminated string"))?;
          self.pos += 1;

          match escape {
            b'"' => out.push('"'),
            b'\\' => out.push('\\'),
            b'/' => out.push('/'),
            b'b' => out.push('\u{8}'),
            b'f' => out.push('\u{c}'),
            b'n' => out.push('\n'),
            b'r' => out.push('\r'),
            b't' => out.push('\t'),
            b'u' => {
              let mut units = vec![self.hex4()?];

              if (0xd800..0xdc00).contains(&units[0]) && self.text[self.pos..].starts_with("\\u") {
                self.pos += 2;
                units.push(self.hex4()?);
              }

              out.extend(
                char::decode_utf16(units).map(|c| c.unwrap_or(char::REPLACEMENT_CHARACTER)),
              );
            }
            _ => return Err(self.error("invalid escape")),
          }
        }
      }
    }
  }

  fn hex4(&mut self) -> Result<u16, String> {
    let digits = self
      .text
      .get(self.pos..self.pos + 4)
      .ok_or_else(|| self.error("invalid \\u escape"))?;
    let unit = u16::from_str_radix(digits, 16).map_err(|_| self.error("invalid \\u escape"))?;
    self.pos += 4;
    Ok(unit)
  }

  fn number(&mut self) -> Result<Value, String> {
    let start = self.pos;

    while matches!(
      self.peek(),
      Some(b'-' | b'+' | b'.' | b'e' | b'E' | b'0'..=b'9')
    ) {
      self.pos += 1;
    }

    self.text[start..self.pos]
      .parse()
      .map(Value::Number)
      .map_err(|_| self.error("invalid number"))
  }

  fn literal(&mut self, word: &str, value: Value) -> Result<Value, String> {
    if !self.text[self.pos..].starts_with(word) {
      return Err(self.error("expected a value"));
    }

    self.pos += word.len();
    Ok(value)
  }

  fn skip_whitespace(&mut self) {
    while matches!(self.peek(), Some(b' ' | b'\t' | b'\n' | b'\r')) {
      self.pos += 1;
    }
  }

  fn peek(&self) -> Option<u8> {
    self.text.as_bytes().get(self.pos).copied()
  }

  fn eat(&mut self, byte: u8) -> bool {
    let matched = self.peek() == Some(byte);
    self.pos += usize::from(matched);
    matched
  }

  fn error(&self, message: &str) -> String {
    format!("{message} at byte {}", self.pos)
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn parses_json_with_trailing_commas() {
    let escape = |hex: &str| format!("\\u{hex}");
    let surrogates = [escape("00e9"), escape("d83d"), escape("de00")].concat();
    let text = format!(r#" {{ "a": [1], "b": {{ "c": "x\"{surrogates}", }}, "a": "last", }} "#);
    let value = parse(&text).unwrap();

    assert_eq!(value.get("a"), Some(&Value::String("last".into())));
    assert_eq!(
      value
        .get("b")
        .and_then(|b| b.get("c"))
        .and_then(Value::as_str),
      Some("x\"é😀")
    );

    let list = parse("[1, -2.5e1, true, null,]").unwrap();
    assert_eq!(
      list,
      Value::Array(vec![
        Value::Number(1.0),
        Value::Number(-25.0),
        Value::Bool(true),
        Value::Null
      ])
    );

    for invalid in [
      "[1,,2]",
      "[,]",
      "{\"a\" 1}",
      "\"open",
      "[1] 2",
      "{\"a\": tru}",
    ] {
      assert!(parse(invalid).is_err(), "{invalid} should not parse");
    }
  }
}
