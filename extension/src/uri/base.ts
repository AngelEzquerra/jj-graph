// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: Apache-2.0

export interface BaseUriParameters {
  readonly repoPath: string
}

export type UriTemplate<TUriType extends string, TUriParameters extends BaseUriParameters> = {
  readonly type: TUriType
} & TUriParameters
