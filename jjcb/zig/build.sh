# SPDX-FileCopyrightText: 2025 Velociraptor115
#
# SPDX-License-Identifier: LGPL-3.0-only

set -e
zig build -Doptimize=ReleaseSmall -Dtarget=aarch64-macos --release=small --summary all
zig build -Doptimize=ReleaseSmall -Dtarget=x86_64-macos --release=small --summary all
zig build -Doptimize=ReleaseSmall -Dtarget=arm-linux --release=small --summary all
zig build -Doptimize=ReleaseSmall -Dtarget=aarch64-linux --release=small --summary all
zig build -Doptimize=ReleaseSmall -Dtarget=x86_64-linux --release=small --summary all
zig build -Doptimize=ReleaseSmall -Dtarget=aarch64-windows --release=small --summary all
zig build -Doptimize=ReleaseSmall -Dtarget=x86_64-windows --release=small --summary all
