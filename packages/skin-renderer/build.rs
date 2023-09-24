use fs_extra::copy_items;
use fs_extra::dir::CopyOptions;
use std::env;

fn main() {
  // This tells cargo to rerun this script if something in models/ changes.
  println!("cargo:rerun-if-changed=models/*");

  let mut copy_options = CopyOptions::new();
  copy_options.overwrite = true;

  let paths_to_copy = vec!["models/"];

  let out_dir = env::var("OUT_DIR").expect("OUT_DIR not set");
  copy_items(&paths_to_copy, out_dir, &copy_options).expect("Failed to copy models to OUT_DIR");

  napi_build::setup();
}
