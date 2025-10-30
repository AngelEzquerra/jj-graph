// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

use std::env;
use std::fs;
use std::thread;
use std::time;

fn main() {
  let args: Vec<String> = env::args().collect();
  if args.len() < 2 {
    return
  }
  let termination_path = &args[1];
  let current_dir = env::current_dir().unwrap();
  println!("{}", current_dir.display());
  let sleep_dur = time::Duration::from_millis(50);
  while let Ok(true) = fs::exists(termination_path) {
    thread::sleep(sleep_dur)
  }
}
