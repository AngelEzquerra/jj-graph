// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: Apache-2.0

import { Uri } from 'vscode'
import { type UriTemplate } from './base'
import * as _diff from './diff'
import { join } from 'path'

export const TYPE_DIFF = 'diff' as const

export type JJUriDiff = UriTemplate<'diff', _diff.UriParameters>

export type JJUri =
  | JJUriDiff


export const SCHEME = 'vscode-jj-graph'

function toJSONQuery<T>(data: T): string {
  return JSON.stringify(data)
}

function fromJSONQuery<T>(jsonQuery: string): T {
  return JSON.parse(jsonQuery)
}

function toUriQuery(data: Record<string, string | number | boolean>): string {
  return Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
}

function fromUriQuery<T extends Record<string, string | number | boolean> | JJUri>(uriQuery: string): T {
  return Object.fromEntries(uriQuery.split('&').map(x => x.split('=').map(decodeURIComponent)))
}

export function fromDiffData(data: JJUriDiff): Uri {
  const { repoPath, commitId, filePath, side, type } = data
  return Uri.file(join(repoPath, filePath)).with({ scheme: SCHEME, query: toUriQuery({ type, repoPath, commitId, filePath, side }) })
}

export function toDiffData(uri: Uri): JJUriDiff {
  const { commitId, filePath, side, repoPath } = fromUriQuery<JJUriDiff>(uri.query)
  return { type: 'diff', repoPath, commitId, filePath, side }
}

export function toJJUri(uri: Uri): JJUri {
  const data = fromUriQuery<JJUri>(uri.query)
  return data
}


