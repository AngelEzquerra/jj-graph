// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import * as api from '@common/api/viewDiff'
import { type IntegrationProvider } from '@/integration'

export async function handleRequest(request: api.RequestParameters, ip: IntegrationProvider): Promise<api.Response> {
  ip.viewDiff(request.repoDir, request.commitId, request.leftPath, request.rightPath)
  return {}
}
