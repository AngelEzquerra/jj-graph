// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

export interface BaseRequestParameters {}

export interface BaseRequestRepoParameters extends BaseRequestParameters {
  readonly repoDir: string
}

export type RequestHandler<TRequestParameters extends BaseRequestParameters, TResponse> = (request: TRequestParameters) => TResponse

export interface RequestResponseTemplate<TRequestType extends string, TRequestParameters extends BaseRequestParameters, TResponse> {
  readonly type: TRequestType
  request: { readonly type: TRequestType } & Omit<TRequestParameters, 'type'>
  response: TResponse
}
