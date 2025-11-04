// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as _listRepos from './listRepos'
import * as _log from './log'
import * as _viewDiff from './viewDiff'
import * as _newChange from './newChange'
import * as _edit from './edit'
import * as _describe from './describe'
import * as _abandon from './abandon'
import type { RequestResponseTemplate } from "./base"

export const REQUEST_LIST_REPOS = 'listRepos' as const
export const REQUEST_LOG = 'log' as const
export const REQUEST_VIEW_DIFF = 'viewDiff' as const
export const REQUEST_NEW_CHANGE = 'newChange' as const
export const REQUEST_EDIT = 'edit' as const
export const REQUEST_DESCRIBE = 'describe' as const
export const REQUEST_ABANDON = 'abandon' as const

type JJApiRequestResponseListRepos = RequestResponseTemplate<typeof REQUEST_LIST_REPOS, _listRepos.RequestParameters, _listRepos.Response>
type JJApiRequestResponseLog = RequestResponseTemplate<typeof REQUEST_LOG, _log.RequestParameters, _log.Response>
type JJApiRequestResponseViewDiff = RequestResponseTemplate<typeof REQUEST_VIEW_DIFF, _viewDiff.RequestParameters, _viewDiff.Response>
type JJApiRequestResponseNewChange = RequestResponseTemplate<typeof REQUEST_NEW_CHANGE, _newChange.RequestParameters, _newChange.Response>
type JJApiRequestResponseEdit = RequestResponseTemplate<typeof REQUEST_EDIT, _edit.RequestParameters, _edit.Response>
type JJApiRequestResponseDescribe = RequestResponseTemplate<typeof REQUEST_DESCRIBE, _describe.RequestParameters, _describe.Response>
type JJApiRequestResponseAbandon = RequestResponseTemplate<typeof REQUEST_ABANDON, _abandon.RequestParameters, _abandon.Response>

export type JJApiRequestListRepos = JJApiRequestResponseListRepos['request']
export type JJApiRequestLog = JJApiRequestResponseLog['request']
export type JJApiRequestViewDiff = JJApiRequestResponseViewDiff['request']
export type JJApiRequestNewChange = JJApiRequestResponseNewChange['request']
export type JJApiRequestEdit = JJApiRequestResponseEdit['request']
export type JJApiRequestDescribe = JJApiRequestResponseDescribe['request']
export type JJApiRequestAbandon = JJApiRequestResponseAbandon['request']
export type JJApiRequest =
  | JJApiRequestListRepos
  | JJApiRequestLog
  | JJApiRequestViewDiff
  | JJApiRequestNewChange
  | JJApiRequestEdit
  | JJApiRequestDescribe
  | JJApiRequestAbandon

export type JJApiResponseListRepos = JJApiRequestResponseListRepos['response']
export type JJApiResponseLog = JJApiRequestResponseLog['response']
export type JJApiResponseDiff = JJApiRequestResponseViewDiff['response']
export type JJApiResponseNewChange = JJApiRequestResponseNewChange['response']
export type JJApiResponseEdit = JJApiRequestResponseEdit['response']
export type JJApiResponseDescribe = JJApiRequestResponseDescribe['response']
export type JJApiResponseAbandon = JJApiRequestResponseAbandon['response']
export type JJApiResponse =
  | JJApiRequestResponseListRepos
  | JJApiRequestResponseLog
  | JJApiRequestResponseViewDiff
  | JJApiRequestResponseNewChange
  | JJApiRequestResponseEdit
  | JJApiRequestResponseDescribe
  | JJApiRequestResponseAbandon
  | { type: 'unknown' }

export function listRepos(): JJApiRequestListRepos {
  return { type: REQUEST_LIST_REPOS }
}

export function log(repoDir: string, revset?: string): JJApiRequestLog {
  return { type: REQUEST_LOG, repoDir, revset }
}

export function viewDiff(repoDir: string, commitId: string, leftPath: string, rightPath: string): JJApiRequestViewDiff {
  return { type: REQUEST_VIEW_DIFF, repoDir, commitId, leftPath, rightPath }
}

export function newChange(repoDir: string, edit: boolean, revset?: string, afterRevset?: string, beforeRevset?: string, message?: string): JJApiRequestNewChange {
  return { type: REQUEST_NEW_CHANGE, repoDir, edit, revset, afterRevset, beforeRevset, message }
}

export function edit(repoDir: string, changeId: string, ignoreImmutable?: boolean): JJApiRequestEdit {
  return { type: REQUEST_EDIT, repoDir, changeId, ignoreImmutable }
}

export function describe(repoDir: string, changeId: string, message: string): JJApiRequestDescribe {
  return { type: REQUEST_DESCRIBE, repoDir, changeId, message }
}

export function abandon(repoDir: string, changeId: string, retainBookmarks?: boolean, restoreDescendants?: boolean): JJApiRequestAbandon {
  return { type: REQUEST_ABANDON, repoDir, changeId, retainBookmarks, restoreDescendants }
}
