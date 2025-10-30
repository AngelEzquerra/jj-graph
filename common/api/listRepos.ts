// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { type BaseRequestParameters } from "./base"

export interface RequestParameters extends BaseRequestParameters {
}

export interface Response {
  repoPaths: string[]
}
