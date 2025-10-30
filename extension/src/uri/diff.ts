// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: Apache-2.0

import { type BaseUriParameters } from "./base"

export interface UriParameters extends BaseUriParameters {
  commitId: string
  filePath: string
  side: 'left' | 'right'
}
