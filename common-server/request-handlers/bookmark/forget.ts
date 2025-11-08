// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api/bookmark/forget'
import { type IntegrationProvider } from '@/integration'
import { invokeJJ } from '@/jj'

function args(request: api.RequestParameters) {
  const args = [
    `bookmark`,
    `forget`,
    request.name,
  ]
  if (request.includeRemotes) {
    args.push(`--include-remotes`)
  }
  return args
}

export async function handleRequest(request: api.RequestParameters, ip: IntegrationProvider): Promise<api.Response> {
  await invokeJJ(request.repoDir, args(request))
  return {}
}
