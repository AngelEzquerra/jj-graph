// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { type BaseRequestRepoParameters } from "./base"

export interface RequestParameters extends BaseRequestRepoParameters {
  commitId: string
  leftPath: string
  rightPath: string
}

export interface Response {

}
