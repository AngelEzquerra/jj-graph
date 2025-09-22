// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

export const REQUEST_LOG = 'log' as const

export type JJApiRequest = {
  request: string
}

export type JJApiResponse = JJApiRequest & {
  response: any
}

export function log(): JJApiRequest {
  return { request: REQUEST_LOG }
}
