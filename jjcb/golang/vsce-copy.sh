# SPDX-FileCopyrightText: 2025 Velociraptor115
#
# SPDX-License-Identifier: LGPL-3.0-only

VSCE_TARGET_DIR=${VSCE_TARGET_DIR:-"../../extension/jjcb"}

cp bin/mac-arm64/jjcb     "${VSCE_TARGET_DIR}/jjcb-mac-arm64"
cp bin/mac-x64/jjcb       "${VSCE_TARGET_DIR}/jjcb-mac-x64"
cp bin/linux-arm/jjcb     "${VSCE_TARGET_DIR}/jjcb-linux-arm"
cp bin/linux-arm64/jjcb   "${VSCE_TARGET_DIR}/jjcb-linux-arm64"
cp bin/linux-x64/jjcb     "${VSCE_TARGET_DIR}/jjcb-linux-x64"
cp bin/win-arm64/jjcb.exe "${VSCE_TARGET_DIR}/jjcb-win-arm64.exe"
cp bin/win-x64/jjcb.exe   "${VSCE_TARGET_DIR}/jjcb-win-x64.exe"
