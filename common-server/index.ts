// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api'
import * as _listRepos from './request-handlers/listRepos'
import * as _log from './request-handlers/log'
import * as _viewDiff from './request-handlers/viewDiff'
import * as _newChange from './request-handlers/newChange'
import * as _edit from './request-handlers/edit'
import * as _describe from './request-handlers/describe'
import * as _abandon from './request-handlers/abandon'
import { type IntegrationProvider } from './integration'

export async function handleRequest(request: api.JJApiRequest, ip: IntegrationProvider): Promise<api.JJApiResponse> {
  console.log('request', request)
  switch (request.type) {
    case api.REQUEST_LIST_REPOS: {
      const response = await _listRepos.handleRequest(request, ip)
      return { type: api.REQUEST_LIST_REPOS, request, response }
    }
    case api.REQUEST_LOG: {
      const response = await _log.handleRequest(request, ip)
      return { type: api.REQUEST_LOG, request, response }
    }
    case api.REQUEST_VIEW_DIFF: {
      const response = await _viewDiff.handleRequest(request, ip)
      return { type: api.REQUEST_VIEW_DIFF, request, response }
    }
    case api.REQUEST_NEW_CHANGE: {
      const response = await _newChange.handleRequest(request, ip)
      return { type: api.REQUEST_NEW_CHANGE, request, response }
    }
    case api.REQUEST_EDIT: {
      const response = await _edit.handleRequest(request, ip)
      return { type: api.REQUEST_EDIT, request, response }
    }
    case api.REQUEST_DESCRIBE: {
      const response = await _describe.handleRequest(request, ip)
      return { type: api.REQUEST_DESCRIBE, request, response }
    }
    case api.REQUEST_ABANDON: {
      const response = await _abandon.handleRequest(request, ip)
      return { type: api.REQUEST_ABANDON, request, response }
    }
    default: {
      return { type: 'unknown' }
    }
  }
}
