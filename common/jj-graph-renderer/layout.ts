// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

type NodeId = number

type Node = {
  id: NodeId
  parents: NodeId[]
}

type ParentLineCreationPreference =
  | 'new'
  | 'existing'
  | 'leftmost'

type NodeCreationPreference =
  | 'existing'
  | 'leftmost'

export type NodeColumnGenOptions = {
  parentLineCreation?: ParentLineCreationPreference
  nodeCreation?: NodeCreationPreference
}

type EdgeId = number
type EdgeDesc = {
  id: EdgeId
  from: NodeId
  to: NodeId
}
type GraphNodeRow = number
type GraphNodeColumn = number

type GraphEdgeInstructionStart = {
  type: 's',
  column: GraphNodeColumn
  row: GraphNodeRow
}

type GraphEdgeInstructionContinue = {
  type: 'c'
}

type GraphEdgeInstructionBranch = {
  type: 'b'
  column: GraphNodeColumn
}

type GraphEdgeInstructionEnd = {
  type: 'e'
}

type GraphEdgeInstruction =
  | GraphEdgeInstructionStart
  | GraphEdgeInstructionContinue
  | GraphEdgeInstructionBranch
  | GraphEdgeInstructionEnd

type GraphEdgePath = GraphEdgeInstruction[]
type GraphEdge = {
  desc: EdgeDesc
  path: GraphEdgePath
}

export type GraphLayout = {
  nodeColumns: GraphNodeColumn[]
  edges: GraphEdge[]
}

function findOrCreateColUsingPreference(pref: ParentLineCreationPreference, colsActiveEdges: GraphEdge[][], nodeIdToMatch: NodeId, shouldLog: boolean = false) {
  let colNumber: GraphNodeColumn = -1

  const leftmostEmptyCol = colsActiveEdges.findIndex(colActiveEdges => colActiveEdges.length === 0)
  const leftmostColWithMatchingDestinationNodeId = colsActiveEdges.findIndex(colActiveEdges => colActiveEdges.some(e => e.desc.to === nodeIdToMatch))

  if (pref === 'existing') {
    colNumber = leftmostColWithMatchingDestinationNodeId
  }

  if (pref === 'leftmost') {
    if (leftmostEmptyCol >= 0 && leftmostColWithMatchingDestinationNodeId >= 0) {
      colNumber = Math.min(leftmostEmptyCol, leftmostColWithMatchingDestinationNodeId)
    } else if (leftmostColWithMatchingDestinationNodeId >= 0) {
      colNumber = leftmostColWithMatchingDestinationNodeId
    }
  }

  if (colNumber < 0) {
    colNumber = leftmostEmptyCol
  }

  if (colNumber < 0) {
    colsActiveEdges.push([])
    colNumber = colsActiveEdges.length - 1
  }

  if (shouldLog) {
    console.log('existingPl', leftmostColWithMatchingDestinationNodeId, 'emptyPl', leftmostEmptyCol, 'chosen', colNumber)
  }

  return colNumber
}

export function genGraphLayout(nodes: Node[], opts: NodeColumnGenOptions = {}): GraphLayout {
  const colsActiveEdges: GraphEdge[][] = []
  const nodeColumns: number[] = []
  const edges: GraphEdge[] = []

  const {
    parentLineCreation = 'new',
    nodeCreation = 'existing',
  } = opts

  console.log('parentLineCreation', parentLineCreation)
  console.log('nodeCreation', nodeCreation)

  for (const node of nodes) {
    const nodeId = node.id
    const colNumber = findOrCreateColUsingPreference(nodeCreation, colsActiveEdges, nodeId)

    // Fulfill all matching parent lines
    for (let i = 0; i < colsActiveEdges.length; i++) {
      const colActiveEdges = colsActiveEdges[i]!
      const edgesToRemove: GraphEdge[] = []
      for (const colActiveEdge of colActiveEdges) {
        if (colActiveEdge.desc.to === nodeId) {
          const fromCol = i
          const toCol = colNumber

          const edgePath = colActiveEdge.path
          if (fromCol !== toCol) {
            edgePath.push({
              type: 'b',
              column: toCol
            })
          }
          edgePath.push({ type: 'c' })
          edgePath.push({ type: 'e' })

          edgesToRemove.push(colActiveEdge)
        }
      }
      colsActiveEdges[i] = colActiveEdges.filter(x => !edgesToRemove.includes(x))
    }

    // Push any parent lines not matching this node on this column to other columns
    const otherActiveEdgesInThisCol = [...colsActiveEdges[colNumber]!]
    colsActiveEdges[colNumber] = [{ desc: {id: -1, from: -1, to: -1}, path: [] }]
    for (const otherActiveEdge of otherActiveEdgesInThisCol) {
      const appropriateCol = findOrCreateColUsingPreference(parentLineCreation, colsActiveEdges, otherActiveEdge.desc.to)
      otherActiveEdge.path.push({ type: 'b', column: appropriateCol })
      colsActiveEdges[appropriateCol]!.push(otherActiveEdge)
    }
    colsActiveEdges[colNumber] = []

    for (let i = 0; i < colsActiveEdges.length; i++) {
      const colActiveEdges = colsActiveEdges[i]!
      for (const colActiveEdge of colActiveEdges) {
        colActiveEdge.path.push({ type: 'c' })
      }
    }

    // Create parent lines for parents of this node
    for (const parentNodeId of node.parents) {
      // console.log(colsActiveEdges.map((colActiveEdges, colIdx) => `${colIdx}: ${colActiveEdges.length === 0 ? 'empty': colActiveEdges.map(e => e.desc.to).join(',')}`).join(' ; '))
      const parentEdge: GraphEdge = {
        desc: {
          id: edges.length,
          from: nodeId,
          to: parentNodeId,
        },
        path: [ { type: 's', column: colNumber, row: nodeId } ]
      }
      edges.push(parentEdge)

      const fromCol = colNumber
      // console.log('edge', node.id, '->', parentNodeId)
      const toCol = findOrCreateColUsingPreference(parentLineCreation, colsActiveEdges, parentNodeId, true)

      if (fromCol !== toCol) {
        parentEdge.path.push({
          type: 'b',
          column: toCol
        })
      }

      colsActiveEdges[toCol]!.push(parentEdge)
    }

    nodeColumns.push(colNumber)
  }
  return {
    nodeColumns,
    edges,
  }
}
