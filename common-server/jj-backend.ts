// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api'

export async function handleRequest(request: api.JJApiRequest): Promise<api.JJApiResponse> {
  switch (request.request) {
    case api.REQUEST_LOG:
      return { ...request, response: 'jj log request received' }
    default:
      return { ...request, response: 'Unknown request' }
  }
}
