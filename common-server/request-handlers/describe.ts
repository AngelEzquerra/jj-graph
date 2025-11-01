// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api/describe'
import { type IntegrationProvider } from '@/integration'
import { invokeJJ } from '@/jj'

function args(request: api.RequestParameters) {
  const args = [
    `describe`,
    `--message`, request.message,
    `change_id(${request.changeId})`,
  ]
  // if (request.ignoreImmutable) {
  //   args.push(`--ignore-immutable`)
  // }
  return args
}

export async function handleRequest(request: api.RequestParameters, ip: IntegrationProvider): Promise<api.Response> {
  await invokeJJ(request.repoDir, args(request))
  return {}
}
