// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import type { InjectionKey } from "vue"
import type { JJCommitGraphCommitNode } from "@common/jj-graph-parser/commit-graph-parser"

export type GraphInteractionContextProvider = {
  setCommitDataContext: (commitData?: JJCommitGraphCommitNode) => void
  setCommitIdContext: (commitId?: string) => void
  setBookmarkContext: (bookmark?: string) => void
  setBeforeAfterContext: (data?: { before: string, after: string }) => void
}

export const GRAPH_INTERACTION_CTX_IK = Symbol() as InjectionKey<GraphInteractionContextProvider>
