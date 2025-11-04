// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

import { type JJDiffSummaryRaw, type JJDiffSummaryFile } from '../models/diff'
import { type JJGraphParseOutput } from './graph-parser'

type NodeId = number

export type JJCommitGraphElidedNode = {
  type: 'elided'
}

type JJSignature = {
  name: string
  email: string
  timestamp: string
}

type JJBookmark = {
  name: string
  remote: string

  // Unnecessary at the moment. Will probably remove
  target?: string[]
  tracking_target?: string[]
}

export type JJCommitGraphCommitNode = {
  type: 'commit'
  description: string
  isMine?: boolean
  isWorkingCopy?: boolean
  isHead?: boolean
  isDivergent?: boolean
  isHidden?: boolean
  isImmutable?: boolean
  isConflicted?: boolean
  isEmpty?: boolean
  changeId: string
  changeIdPrefixLen: number
  commitId: string
  commitIdPrefixLen: number
  author: JJSignature
  committer: JJSignature
  parents: string[]
  // diffSummaryRaw: DiffSummaryRaw
  diffSummaryFiles: JJDiffSummaryFile[]
  bookmarksLocal: JJBookmark[]
  bookmarksRemote: JJBookmark[]
  tags: JJBookmark[]
}

export type JJCommitGraphCommitIdNode = {
  type: 'commitId'
  commitId: string
}

export type JJCommitGraphNodeData =
  | JJCommitGraphElidedNode
  | JJCommitGraphCommitNode
  | JJCommitGraphCommitIdNode

export type JJCommitGraphNode = {
  id: NodeId
  data: JJCommitGraphNodeData

  // parents are effectively an ordered set
  parents: NodeId[]
  // children are effectively an unordered set
  children: NodeId[]
}

export type JJCommitGraphOutput = {
  nodes: JJCommitGraphNode[]
  directedEdges: [NodeId, NodeId][]
}

export type JJCommitGraphParser = {
  parseJJCommitGraph: (parsedGraphOutput: JJGraphParseOutput) => JJCommitGraphOutput
}

const UNKNOWN_COMMIT_ID = 'unknown'
function commitIdFromNodeData(nodeData: JJCommitGraphNodeData): string {
  if (nodeData.type === 'commit') {
    return nodeData.commitId
  }
  if (nodeData.type === 'commitId') {
    return nodeData.commitId
  }
  return UNKNOWN_COMMIT_ID
}

export function createJJCommitGraphParser(): JJCommitGraphParser {
  const ELIDED_REVISIONS_EXACT_MATCH = '(elided revisions)'

  function parseJJCommitGraph(parsedGraphOutput: JJGraphParseOutput): JJCommitGraphOutput {
    const nodes: JJCommitGraphNode[] = []
    for (const graphNode of parsedGraphOutput.nodes) {
      const rawData = graphNode.data.trim()
      let data: JJCommitGraphNodeData
      if (rawData === ELIDED_REVISIONS_EXACT_MATCH) {
        data = { type: 'elided' }
      } else if (rawData.startsWith("{")) {
        data = { ...JSON.parse(rawData), type: 'commit' }
      } else {
        data = { type: 'commitId', commitId: rawData }
      }

      nodes.push({
        id: graphNode.row,
        data,
        // Will reorder parents in the subsequent section
        parents: [...graphNode.parents],
        children: [...graphNode.children],
      })
    }

    nodes.sort((a, b) => a.id - b.id)

    for (const node of nodes) {
      if (node.data.type !== 'commit') {
        continue
      }
      const perGraphParentCommitIds: (string | null)[] = node.parents.map(parentNodeId => commitIdFromNodeData(nodes[parentNodeId]!.data))
      const parentCommitIds = node.data.parents

      const reorderedParents: (NodeId | null)[] = []

      for (const parentCommitId of parentCommitIds) {
        const existingIndex = perGraphParentCommitIds.findIndex(x => x === parentCommitId)
        if (existingIndex >= 0) {
          reorderedParents.push(node.parents[existingIndex]!)
          perGraphParentCommitIds[existingIndex] = null
        } else {
          reorderedParents.push(null)
        }
      }

      for (let i = 0; i < reorderedParents.length; i++) {
        if (reorderedParents[i] === null) {
          const existingIndex = perGraphParentCommitIds.findIndex(x => x !== null)
          reorderedParents[i] = node.parents[existingIndex]!
          perGraphParentCommitIds[existingIndex] = null
        }
      }

      for (let i = 0; i < node.parents.length; i++) {
        const parentNodeId = node.parents[i]!
        if (reorderedParents.findIndex(x => x === parentNodeId) < 0) {
          reorderedParents.push(parentNodeId)
        }
      }

      node.parents = reorderedParents as NodeId[]
    }

    const directedEdges: [NodeId, NodeId][] = []

    for (const node of nodes) {
      for (const parentNodeId of node.parents) {
        directedEdges.push([ node.id, parentNodeId ])
      }
    }

    return {
      nodes,
      directedEdges,
    }
  }

  return {
    parseJJCommitGraph
  }
}
