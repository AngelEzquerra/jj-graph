# SPDX-FileCopyrightText: 2025 Velociraptor115
#
# SPDX-License-Identifier: LGPL-3.0-only

VSCE_TARGET_DIR=${VSCE_TARGET_DIR:-"../../extension/jjcb"}

cp zig-out/bin/jjcb_macos_aarch64       "${VSCE_TARGET_DIR}/jjcb-mac-arm64"
cp zig-out/bin/jjcb_macos_x86_64        "${VSCE_TARGET_DIR}/jjcb-mac-x64"
cp zig-out/bin/jjcb_linux_arm           "${VSCE_TARGET_DIR}/jjcb-linux-arm"
cp zig-out/bin/jjcb_linux_aarch64       "${VSCE_TARGET_DIR}/jjcb-linux-arm64"
cp zig-out/bin/jjcb_linux_x86_64        "${VSCE_TARGET_DIR}/jjcb-linux-x64"
cp zig-out/bin/jjcb_windows_aarch64.exe "${VSCE_TARGET_DIR}/jjcb-win-arm64.exe"
cp zig-out/bin/jjcb_windows_x86_64.exe  "${VSCE_TARGET_DIR}/jjcb-win-x64.exe"
