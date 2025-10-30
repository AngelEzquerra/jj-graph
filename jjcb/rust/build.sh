# SPDX-FileCopyrightText: 2025 Velociraptor115
#
# SPDX-License-Identifier: LGPL-3.0-only

rm -rf ./bin
rm -rf ./target

cargo build -r --target aarch64-apple-darwin
cargo build -r --target x86_64-apple-darwin
cargo build -r --target arm-unknown-linux-gnueabi
cargo build -r --target aarch64-unknown-linux-gnu
cargo build -r --target x86_64-unknown-linux-gnu
cargo build -r --target aarch64-pc-windows-msvc
cargo build -r --target x86_64-pc-windows-msvc

