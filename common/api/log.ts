// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { type JJCommitGraphNode } from "../jj-graph-parser/commit-graph-parser"
import { type BaseRequestRepoParameters } from "./base"

export interface RequestParameters extends BaseRequestRepoParameters {
  revset?: string
}

export interface Response {
  nodes: JJCommitGraphNode[]
}
