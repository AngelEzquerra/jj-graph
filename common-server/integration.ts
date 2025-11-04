// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

export interface IntegrationProvider {
  listRepos(): string[]
  viewDiff(repoPath: string, commitId: string, leftPath: string, rightPath: string): void
}
