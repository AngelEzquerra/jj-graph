// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as _listRepos from './listRepos'
import * as _log from './log'
import type { RequestResponseTemplate } from "./base"

export const REQUEST_LIST_REPOS = 'listRepos' as const
export const REQUEST_LOG = 'log' as const

type JJApiRequestResponseListRepos = RequestResponseTemplate<typeof REQUEST_LIST_REPOS, _listRepos.RequestParameters, _listRepos.Response>
type JJApiRequestResponseLog = RequestResponseTemplate<typeof REQUEST_LOG, _log.RequestParameters, _log.Response>

export type JJApiRequestListRepos = JJApiRequestResponseListRepos['request']
export type JJApiRequestLog = JJApiRequestResponseLog['request']
export type JJApiRequest =
  | JJApiRequestListRepos
  | JJApiRequestLog

export type JJApiResponseListRepos = JJApiRequestResponseListRepos['response']
export type JJApiResponseLog = JJApiRequestResponseLog['response']
export type JJApiResponse =
  | JJApiRequestResponseListRepos
  | JJApiRequestResponseLog
  | { type: 'unknown' }

export function listRepos(): JJApiRequestListRepos {
  return { type: REQUEST_LIST_REPOS }
}

export function log(repoDir: string, revset?: string): JJApiRequestLog {
  return { type: REQUEST_LOG, repoDir, revset }
}
