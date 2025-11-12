// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import type { InjectionKey } from "vue"

export type GraphActionsProvider = {
  viewDiff: (commitId: string, leftPath: string, rightPath: string) => void
  newBetween: (beforeChangeIds: string[], afterChangeIds: string[]) => void
  newAfter: (changeIds: string[]) => void
  newBefore: (changeIds: string[]) => void
  newFrom: (changeIds: string[]) => void
  edit: (changeId: string) => void
  describe: (changeId: string, existingMessage: string) => void
  abandon: (changeIds: string[]) => void

  bookmarkCreate: (changeId: string) => void
  bookmarkDelete: (name: string) => void
  bookmarkForget: (name: string, includeRemotes: boolean) => void
  bookmarkRename: (oldName: string) => void
  bookmarkSet: (name: string) => void
}

export const GRAPH_ACTIONS_INJECTION_KEY = Symbol() as InjectionKey<GraphActionsProvider>
