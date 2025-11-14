// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api/operation/latestId'
import { type IntegrationProvider } from '@/integration'
import { invokeJJ } from '@/jj'

function args(request: api.RequestParameters) {
  const args = [
    `op`,
    `log`,
    `-T`, `id`,
    `-n`, `1`,
    `--no-pager`,
    `--no-graph`,
    `--ignore-working-copy`,
  ]
  return args
}

export async function handleRequest(request: api.RequestParameters, ip: IntegrationProvider): Promise<api.Response> {
  const [cpStdio, cpStderr] = await invokeJJ(request.repoDir, args(request))
  return { id: cpStdio }
}
