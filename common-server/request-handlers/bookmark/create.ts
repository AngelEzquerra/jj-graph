// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api/bookmark/create'
import { type IntegrationProvider } from '@/integration'
import { invokeJJ } from '@/jj'

function args(request: api.RequestParameters) {
  const args = [
    `bookmark`,
    `create`,
    `-r`,
    `change_id(${request.changeId})`,
    request.name,
  ]
  return args
}

export async function handleRequest(request: api.RequestParameters, ip: IntegrationProvider): Promise<api.Response> {
  await invokeJJ(request.repoDir, args(request))
  return {}
}
