// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import type { InjectionKey } from "vue"

export type GraphActionsProvider = {
  viewDiff: (commitId: string, filePath: string) => void
  newAfter: (changeId: string) => void
  newBefore: (changeId: string) => void
  newFrom: (changeId: string) => void
  edit: (changeId: string) => void
  describe: (changeId: string, existingMessage: string) => void
  abandon: (changeId: string) => void
}

export const GRAPH_ACTIONS_INJECTION_KEY = Symbol() as InjectionKey<GraphActionsProvider>
