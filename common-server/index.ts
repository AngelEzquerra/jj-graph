// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api'
import * as _listRepos from './request-handlers/listRepos'
import * as _log from './request-handlers/log'
import * as _viewDiff from './request-handlers/viewDiff'
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
    default: {
      return { type: 'unknown' }
    }
  }
}
