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
import * as _bookmark from './bookmark'
import * as _operation from './operation'
import type { RequestResponseTemplate } from "./base"

export const REQUEST_LIST_REPOS = 'listRepos' as const
export const REQUEST_LOG = 'log' as const
export const REQUEST_VIEW_DIFF = 'viewDiff' as const
export const REQUEST_NEW_CHANGE = 'newChange' as const
export const REQUEST_EDIT = 'edit' as const
export const REQUEST_DESCRIBE = 'describe' as const
export const REQUEST_ABANDON = 'abandon' as const

export const REQUEST_BOOKMARK_CREATE = 'bookmarkCreate' as const
export const REQUEST_BOOKMARK_DELETE = 'bookmarkDelete' as const
export const REQUEST_BOOKMARK_FORGET = 'bookmarkForget' as const
export const REQUEST_BOOKMARK_RENAME = 'bookmarkRename' as const
export const REQUEST_BOOKMARK_SET = 'bookmarkSet' as const

export const REQUEST_OPERATION_LATEST_ID = 'operationLatestId' as const

type JJApiRequestResponseListRepos = RequestResponseTemplate<typeof REQUEST_LIST_REPOS, _listRepos.RequestParameters, _listRepos.Response>
type JJApiRequestResponseLog = RequestResponseTemplate<typeof REQUEST_LOG, _log.RequestParameters, _log.Response>
type JJApiRequestResponseViewDiff = RequestResponseTemplate<typeof REQUEST_VIEW_DIFF, _viewDiff.RequestParameters, _viewDiff.Response>
type JJApiRequestResponseNewChange = RequestResponseTemplate<typeof REQUEST_NEW_CHANGE, _newChange.RequestParameters, _newChange.Response>
type JJApiRequestResponseEdit = RequestResponseTemplate<typeof REQUEST_EDIT, _edit.RequestParameters, _edit.Response>
type JJApiRequestResponseDescribe = RequestResponseTemplate<typeof REQUEST_DESCRIBE, _describe.RequestParameters, _describe.Response>
type JJApiRequestResponseAbandon = RequestResponseTemplate<typeof REQUEST_ABANDON, _abandon.RequestParameters, _abandon.Response>
type JJApiRequestResponseBookmarkCreate = RequestResponseTemplate<typeof REQUEST_BOOKMARK_CREATE, _bookmark.create.RequestParameters, _bookmark.create.Response>
type JJApiRequestResponseBookmarkDelete = RequestResponseTemplate<typeof REQUEST_BOOKMARK_DELETE, _bookmark.delete.RequestParameters, _bookmark.delete.Response>
type JJApiRequestResponseBookmarkForget = RequestResponseTemplate<typeof REQUEST_BOOKMARK_FORGET, _bookmark.forget.RequestParameters, _bookmark.forget.Response>
type JJApiRequestResponseBookmarkRename = RequestResponseTemplate<typeof REQUEST_BOOKMARK_RENAME, _bookmark.rename.RequestParameters, _bookmark.rename.Response>
type JJApiRequestResponseBookmarkSet = RequestResponseTemplate<typeof REQUEST_BOOKMARK_SET, _bookmark.set.RequestParameters, _bookmark.set.Response>
type JJApiRequestResponseOperationLatestId = RequestResponseTemplate<typeof REQUEST_OPERATION_LATEST_ID, _operation.latestId.RequestParameters, _operation.latestId.Response>

export type JJApiRequestListRepos = JJApiRequestResponseListRepos['request']
export type JJApiRequestLog = JJApiRequestResponseLog['request']
export type JJApiRequestViewDiff = JJApiRequestResponseViewDiff['request']
export type JJApiRequestNewChange = JJApiRequestResponseNewChange['request']
export type JJApiRequestEdit = JJApiRequestResponseEdit['request']
export type JJApiRequestDescribe = JJApiRequestResponseDescribe['request']
export type JJApiRequestAbandon = JJApiRequestResponseAbandon['request']
export type JJApiRequestBookmarkCreate = JJApiRequestResponseBookmarkCreate['request']
export type JJApiRequestBookmarkDelete = JJApiRequestResponseBookmarkDelete['request']
export type JJApiRequestBookmarkForget = JJApiRequestResponseBookmarkForget['request']
export type JJApiRequestBookmarkRename = JJApiRequestResponseBookmarkRename['request']
export type JJApiRequestBookmarkSet = JJApiRequestResponseBookmarkSet['request']
export type JJApiRequestOperationLatestId = JJApiRequestResponseOperationLatestId['request']
export type JJApiRequest =
  | JJApiRequestListRepos
  | JJApiRequestLog
  | JJApiRequestViewDiff
  | JJApiRequestNewChange
  | JJApiRequestEdit
  | JJApiRequestDescribe
  | JJApiRequestAbandon
  | JJApiRequestBookmarkCreate
  | JJApiRequestBookmarkDelete
  | JJApiRequestBookmarkForget
  | JJApiRequestBookmarkRename
  | JJApiRequestBookmarkSet
  | JJApiRequestOperationLatestId

export type JJApiResponseListRepos = JJApiRequestResponseListRepos['response']
export type JJApiResponseLog = JJApiRequestResponseLog['response']
export type JJApiResponseDiff = JJApiRequestResponseViewDiff['response']
export type JJApiResponseNewChange = JJApiRequestResponseNewChange['response']
export type JJApiResponseEdit = JJApiRequestResponseEdit['response']
export type JJApiResponseDescribe = JJApiRequestResponseDescribe['response']
export type JJApiResponseAbandon = JJApiRequestResponseAbandon['response']
export type JJApiResponseBookmarkCreate = JJApiRequestResponseBookmarkCreate['response']
export type JJApiResponseBookmarkDelete = JJApiRequestResponseBookmarkDelete['response']
export type JJApiResponseBookmarkForget = JJApiRequestResponseBookmarkForget['response']
export type JJApiResponseBookmarkRename = JJApiRequestResponseBookmarkRename['response']
export type JJApiResponseBookmarkSet = JJApiRequestResponseBookmarkSet['response']
export type JJApiResponseOperationLatestId = JJApiRequestResponseOperationLatestId['response']
export type JJApiResponse =
  | JJApiRequestResponseListRepos
  | JJApiRequestResponseLog
  | JJApiRequestResponseViewDiff
  | JJApiRequestResponseNewChange
  | JJApiRequestResponseEdit
  | JJApiRequestResponseDescribe
  | JJApiRequestResponseAbandon
  | JJApiRequestResponseBookmarkCreate
  | JJApiRequestResponseBookmarkDelete
  | JJApiRequestResponseBookmarkForget
  | JJApiRequestResponseBookmarkRename
  | JJApiRequestResponseBookmarkSet
  | JJApiRequestResponseOperationLatestId
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

export function abandon(repoDir: string, revset: string, retainBookmarks?: boolean, restoreDescendants?: boolean): JJApiRequestAbandon {
  return { type: REQUEST_ABANDON, repoDir, revset, retainBookmarks, restoreDescendants }
}

export function bookmarkCreate(repoDir: string, changeId: string, name: string): JJApiRequestBookmarkCreate {
  return { type: REQUEST_BOOKMARK_CREATE, repoDir, changeId, name }
}

export function bookmarkDelete(repoDir: string, name: string): JJApiRequestBookmarkDelete {
  return { type: REQUEST_BOOKMARK_DELETE, repoDir, name }
}

export function bookmarkForget(repoDir: string, name: string, includeRemotes: boolean): JJApiRequestBookmarkForget {
  return { type: REQUEST_BOOKMARK_FORGET, repoDir, name, includeRemotes }
}

export function bookmarkRename(repoDir: string, oldName: string, newName: string): JJApiRequestBookmarkRename {
  return { type: REQUEST_BOOKMARK_RENAME, repoDir, oldName, newName }
}

export function bookmarkSet(repoDir: string, name: string, changeId: string, allowBackwards?: boolean): JJApiRequestBookmarkSet {
  return { type: REQUEST_BOOKMARK_SET, repoDir, name, changeId, allowBackwards }
}

export function operationLatestId(repoDir: string): JJApiRequestOperationLatestId {
  return { type: REQUEST_OPERATION_LATEST_ID, repoDir }
}
