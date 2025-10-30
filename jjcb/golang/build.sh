# SPDX-FileCopyrightText: 2025 Velociraptor115
#
# SPDX-License-Identifier: LGPL-3.0-only

GOOS=darwin GOARCH=arm64 go build -o bin/mac-arm64/
GOOS=darwin GOARCH=amd64 go build -o bin/mac-x64/
GOOS=linux GOARCH=arm go build -o bin/linux-arm/
GOOS=linux GOARCH=arm64 go build -o bin/linux-arm64/
GOOS=linux GOARCH=amd64 go build -o bin/linux-x64/
GOOS=windows GOARCH=arm64 go build -o bin/win-arm64/
GOOS=windows GOARCH=amd64 go build -o bin/win-x64/
