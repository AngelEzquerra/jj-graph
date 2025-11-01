// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api/newChange'
import { type IntegrationProvider } from '@/integration'
import { invokeJJ } from '@/jj'

function args(request: api.RequestParameters) {
  const args = [
    `new`,
  ]
  if (!request.edit) {
    args.push(`--no-edit`)
  }
  if (request.message) {
    args.push(`--message`, request.message)
  }
  if (request.afterRevset || request.beforeRevset) {
    if (request.afterRevset) {
      args.push(`--insert-after`, request.afterRevset)
    }
    if (request.beforeRevset) {
      args.push(`--insert-before`, request.beforeRevset)
    }
  } else if (request.revset) {
    args.push(request.revset)
  }
  return args
}

export async function handleRequest(request: api.RequestParameters, ip: IntegrationProvider): Promise<api.Response> {
  await invokeJJ(request.repoDir, args(request))
  return {}
}
